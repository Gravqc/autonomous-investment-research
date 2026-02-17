# Deployment Strategy - Autonomous Investment Research

This document outlines the complete deployment strategy for the Autonomous Investment Research system using **Vercel** (Frontend) and **Railway** (Backend API) with **Supabase PostgreSQL**.

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Vercel)      │───▶│   (Railway)     │───▶│   (Supabase)    │
│   Next.js       │    │   FastAPI       │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │  GitHub Actions │              │
         └──────────────│  (Daily Trades) │──────────────┘
                        │  (Workflows)    │
                        └─────────────────┘
```

**Current Setup:**
- ✅ Database: Supabase PostgreSQL (already deployed)
- ✅ Environment Variables: GitHub Secrets (already configured)
- ✅ Daily Workflows: GitHub Actions (already configured)
- 🔄 Frontend: Deploy to Vercel
- 🔄 Backend API: Deploy to Railway

---

## 📋 Pre-Deployment Checklist

### ✅ Already Completed
- [x] Supabase PostgreSQL database deployed
- [x] Environment variables stored in GitHub Secrets
- [x] GitHub Actions workflow for daily trades configured
- [x] Database schema and seed data ready

### 🔄 To Complete
- [ ] Deploy FastAPI backend to Railway
- [ ] Deploy Next.js frontend to Vercel
- [ ] Configure environment variables in deployment platforms
- [ ] Test API connectivity between services
- [ ] Initialize database schema in Supabase
- [ ] Verify GitHub Actions can access deployed services

---

## 🚀 Backend Deployment (Railway)

### Step 1: Railway Setup
1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub account
   - Connect your repository

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `autonomous-investment-research` repository
   - Set **Root Directory**: `backend`

### Step 2: Railway Configuration
1. **Service Settings**
   - Service Name: `autonomous-investment-api`
   - Build Command: `poetry install --no-dev`
   - Start Command: `uvicorn investment_engine.main:app --host 0.0.0.0 --port $PORT`
   - Port: `8000` (Railway will provide $PORT)

2. **Environment Variables** (Copy from GitHub Secrets)
   ```
   POSTGRES_URL=your_supabase_postgres_url
   OPENAI_API_KEY=your_openai_api_key
   OLLAMA_HOST=optional
   FRONTEND_ORIGIN=https://your-vercel-app.vercel.app
   PYTHONPATH=/app/src
   ENVIRONMENT=production
   ```

3. **Health Check**
   - Path: `/api/health`
   - Timeout: 30 seconds

### Step 3: Deploy Backend
1. **Trigger Deployment**
   - Railway will automatically build and deploy
   - Monitor build logs for any issues
   - Note the generated Railway URL: `https://your-app.railway.app`

2. **Verify Deployment**
   - Visit: `https://your-app.railway.app/api/health`
   - Should return: `{"status": "ok"}`
   - Check API docs: `https://your-app.railway.app/docs`

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Vercel Setup
1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub account
   - Import your repository

2. **Project Configuration**
   - Framework Preset: **Next.js**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Step 2: Environment Variables
Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_FASTAPI_URL=https://your-railway-app.railway.app
```

### Step 3: Deploy Frontend
1. **Trigger Deployment**
   - Vercel will automatically build and deploy
   - Monitor build logs
   - Note the generated Vercel URL: `https://your-app.vercel.app`

2. **Update Backend CORS**
   - Go back to Railway
   - Update `FRONTEND_ORIGIN` environment variable
   - Set to your Vercel URL: `https://your-app.vercel.app`
   - Redeploy backend service

---

## 🗄️ Database Initialization

### Step 1: Access Supabase
1. **Get Database Connection**
   - Go to Supabase Dashboard
   - Project → Settings → Database
   - Copy the connection string
   - Format: `postgresql://postgres:[password]@[host]:5432/postgres`

### Step 2: Initialize Schema
You have two options:

**Option A: Using Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and connect to your project
railway login
railway link

# Run database initialization
railway run python src/investment_engine/db/init_db.py
railway run python scripts/seed.py
```

**Option B: Using GitHub Actions**
Create a manual workflow trigger to initialize the database:

```yaml
# Add to .github/workflows/init-db.yml
name: Initialize Database
on:
  workflow_dispatch:

jobs:
  init-db:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install poetry
          poetry install
      - name: Initialize Database
        env:
          POSTGRES_URL: ${{ secrets.POSTGRES_URL }}
        run: |
          cd backend
          poetry run python src/investment_engine/db/init_db.py
          poetry run python scripts/seed.py
```

---

## 🔧 Environment Variables Mapping

### GitHub Secrets → Railway
Map your existing GitHub secrets to Railway environment variables:

| GitHub Secret | Railway Environment Variable | Description |
|---------------|------------------------------|-------------|
| `POSTGRES_URL` | `POSTGRES_URL` | Supabase PostgreSQL connection |
| `OPENAI_API_KEY` | `OPENAI_API_KEY` | OpenAI API key |
| `OLLAMA_HOST` | `OLLAMA_HOST` | Optional Ollama host |
| - | `FRONTEND_ORIGIN` | Your Vercel app URL |
| - | `PYTHONPATH` | `/app/src` |
| - | `ENVIRONMENT` | `production` |

### GitHub Secrets → Vercel
Map your secrets to Vercel environment variables:

| GitHub Secret | Vercel Environment Variable | Description |
|---------------|----------------------------|-------------|
| - | `NEXT_PUBLIC_API_URL` | Your Vercel app URL |
| - | `NEXT_PUBLIC_FASTAPI_URL` | Your Railway app URL |

---

## 🔄 GitHub Actions Integration

### Update Existing Workflow
Your existing GitHub Actions workflow needs to access the deployed Railway API instead of local services.

**Update `.github/workflows/daily-flow.yml`:**
1. **Add Railway API URL**
   ```yaml
   env:
     RAILWAY_API_URL: https://your-railway-app.railway.app
   ```

2. **Update Database Access**
   - Ensure `POSTGRES_URL` secret points to Supabase
   - GitHub Actions will connect directly to Supabase for database operations

3. **API Health Check**
   Add a step to verify the Railway API is healthy before running trades:
   ```yaml
   - name: Check API Health
     run: |
       curl -f ${{ env.RAILWAY_API_URL }}/api/health || exit 1
   ```

---

## 🧪 Testing Deployment

### Step 1: API Testing
```bash
# Test Railway API endpoints
curl https://your-railway-app.railway.app/api/health
curl https://your-railway-app.railway.app/api/portfolio/current
curl https://your-railway-app.railway.app/api/decisions/recent
```

### Step 2: Frontend Testing
1. **Visit Vercel App**
   - Go to: `https://your-app.vercel.app`
   - Verify dashboard loads with real data
   - Check portfolio page shows current positions
   - Verify decisions page displays AI decisions

2. **API Integration**
   - Verify frontend can fetch data from Railway API
   - Check browser network tab for successful API calls
   - Ensure CORS is properly configured

### Step 3: End-to-End Testing
1. **Manual Trade Execution**
   - Trigger GitHub Actions workflow manually
   - Verify trades are executed and stored in Supabase
   - Check that frontend reflects new data

2. **Real-time Data Flow**
   - Verify market data fetching works
   - Check portfolio valuation updates
   - Ensure AI decisions are generated and stored

---

## 🚨 Troubleshooting

### Common Issues

**Railway Deployment Fails**
- Check build logs for Python/Poetry errors
- Verify `PYTHONPATH` is set to `/app/src`
- Ensure all dependencies are in `pyproject.toml`

**Vercel Build Fails**
- Check Node.js version compatibility
- Verify all environment variables are set
- Check for TypeScript errors

**API Connection Issues**
- Verify CORS settings in FastAPI
- Check `FRONTEND_ORIGIN` matches Vercel URL exactly
- Ensure Railway service is running and healthy

**Database Connection Issues**
- Verify Supabase connection string format
- Check database credentials and permissions
- Ensure database schema is initialized

**GitHub Actions Fails**
- Verify all secrets are properly set
- Check Railway API is accessible from GitHub runners
- Ensure database connection works from GitHub Actions

### Debug Commands

**Railway Logs**
```bash
railway logs
```

**Vercel Logs**
```bash
vercel logs your-app.vercel.app
```

**Test Database Connection**
```bash
# From local machine
psql "your_supabase_connection_string"
```

---

## 📈 Post-Deployment Monitoring

### Health Checks
1. **Set up monitoring for:**
   - Railway API uptime
   - Vercel frontend availability
   - Supabase database connectivity
   - GitHub Actions workflow success

2. **Key Metrics to Monitor:**
   - API response times
   - Database query performance
   - Frontend load times
   - Daily workflow execution success

### Maintenance Tasks
1. **Regular Updates:**
   - Monitor dependency updates
   - Update environment variables as needed
   - Review and optimize database queries

2. **Scaling Considerations:**
   - Monitor Railway resource usage
   - Consider upgrading plans as needed
   - Optimize API endpoints for performance

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [ ] Supabase PostgreSQL is accessible
- [ ] GitHub Secrets are properly configured
- [ ] Code is pushed to main branch
- [ ] All tests pass locally

### Railway Backend
- [ ] Railway project created and connected to GitHub
- [ ] Environment variables configured
- [ ] Backend deployed successfully
- [ ] Health check endpoint responds
- [ ] API documentation accessible

### Vercel Frontend
- [ ] Vercel project created and connected to GitHub
- [ ] Environment variables configured
- [ ] Frontend deployed successfully
- [ ] App loads and displays data
- [ ] API integration working

### Database Setup
- [ ] Database schema initialized
- [ ] Seed data loaded
- [ ] Connection from Railway verified
- [ ] Connection from GitHub Actions verified

### Final Testing
- [ ] End-to-end workflow tested
- [ ] GitHub Actions can execute trades
- [ ] Frontend displays real-time data
- [ ] All API endpoints functional
- [ ] CORS properly configured

---

## 🔗 Useful Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **GitHub Actions**: https://github.com/your-username/your-repo/actions

---

## 📞 Support

If you encounter issues during deployment:

1. **Check the logs** in Railway/Vercel dashboards
2. **Verify environment variables** are correctly set
3. **Test API endpoints** individually
4. **Review GitHub Actions** workflow logs
5. **Check database connectivity** from all services

Remember: Your GitHub secrets are already configured, so focus on mapping them correctly to the deployment platforms and ensuring proper service connectivity.

---

**🚀 Ready to deploy? Follow the steps above in order, and you'll have a fully functional autonomous investment research system running in production!**