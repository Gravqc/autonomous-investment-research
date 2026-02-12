from investment_engine.workflows.flows.daily_flow import daily_flow


def main():
    print("Starting Daily Investment Flow")
    daily_flow()
    print("Finished Daily Investment Flow")


if __name__ == "__main__":
    main()
