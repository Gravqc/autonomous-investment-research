"""
Start Prefect Server 
"""
import os
import subprocess

def main():
    os.environ["PREFECT_API_URL"] = "http://127.0.0.1:4200/api"

    print("Starting Prefect Server")
    print("Prefect UI will be available at: http://127.0.0.1:4200")

    subprocess.run(["prefect", "server", "start"])

if __name__ == "__main__":
    main()