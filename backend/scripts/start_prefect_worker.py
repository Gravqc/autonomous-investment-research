"""
Start Prefect worker
"""
import os
import subprocess

def main():
    os.environ["PREFECT_API_URL"] = "http://127.0.0.1:4200/api"

    print("Starting Prefect Worker")
    print("Connecting to  http://127.0.0.1:4200")

    subprocess.run(["prefect", "worker", "start", "--pool", "default-agent-pool"])

if __name__ == "__main__":
    main()