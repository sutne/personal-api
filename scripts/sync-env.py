import os


# WARNING
# looks like using this script is NOT a good idea as some values
# have \n appended to them, making them invalid


# hides output from vercel cli when appended to command
suppress = ">/dev/null 2>&1"

# Check if the .env file exists
if not os.path.isfile(".env"):
    print("File '.env' does not exist")
    exit(1)

# Read the .env file
with open(".env", "r") as env_file:
    for nr, line in enumerate(env_file):
        if not line.strip():
            continue  # Skip empty lines
        if line.startswith("#"):
            continue  # Skip comments

        # make sure key and value are not empty
        variable = [val.strip() for val in line.split("=", 1)]
        if len(variable) != 2 or "" in variable:
            print(f"Invalid line in '.env': {nr}")
            continue

        key, value = variable

        # Docs say you can add/remove to multiple environments at once, but
        # i am not able to hence the loop below
        for env in ["production", "preview", "development"]:
            # Remove the variable if it exists, suppress output
            os.system(f"npx vercel env rm {key} {env} -y {suppress}")
            # Add the variable with local value
            os.system(f"echo {value} | npx vercel env add {key} {env}")

print("\nDone")
