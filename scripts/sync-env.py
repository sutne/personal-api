import os

# hide output from vercel cli
suppress = ">/dev/null 2>&1"

# Check if the .env file exists
if not os.path.isfile(".env"):
    print("File '.env' does not exist")
    exit(1)

# Read the .env file
with open(".env", "r") as env_file:
    for nr, line in enumerate(env_file):
        # Check if the line is not empty
        if not line.strip():
            continue
        # Check if the line is not a comment
        if line.startswith("#"):
            continue
        # Split the line by the equal sign
        variable = [val.strip() for val in line.split("=", 1)]
        if not variable or len(variable) != 2:
            print(f"Invalid line in '.env': {nr}:{line}")
            continue
        key, value = variable
        if not key or not value:
            print(f"Invalid line in '.env': {nr}:{line}")
            continue

        # Remove the variable if it exists, suppress output
        os.system(f"vercel env rm {key} -y {suppress}")
        # Add the variable with local value
        os.system(f"echo {value} | vercel env add {key} production")
