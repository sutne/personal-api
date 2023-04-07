import os
import json
import dotenv
from util import format_url, format_curl

# src: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
# scopes: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps#available-scopes
permissions = [
    "repo",
]
SCOPES = ",".join(permissions)


# Step 0: Load / set environment variables from the github OAth App settings
dotenv.load_dotenv(dotenv.find_dotenv())
GITHUB_CLIENT_ID = os.environ.get("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.environ.get("GITHUB_CLIENT_SECRET")
GITHUB_REDIRECT_URI = os.environ.get("GITHUB_REDIRECT_URI")

if not all([GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URI]):
    print("An environment variable wasn't set")
    exit(0)


# Step 1: request user (me) to allow application to access data
print("Go to the following link and follow the instructions:")
request_access_url = format_url(
    "https://github.com/login/oauth/authorize",
    args={
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": GITHUB_REDIRECT_URI,
        "scope": SCOPES,
    },
)
print(f"\n{request_access_url}\n")


# Step 2: when complete, user is redirected to the redirect_uri with a code
print(f"When you were done you were redirected to '{GITHUB_REDIRECT_URI}?code=XXXXXXX'")
url_with_code = input(f"Paste the full URL (with code) here: ")
CODE = url_with_code.split("?code=")[1]


# Step 3: exchange code for access token
command = format_curl(
    "https://github.com/login/oauth/access_token",
    headers={
        "Accept": "application/json",
    },
    args={
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": CODE,
    },
)
json_response = json.loads(os.popen(command).read())


# Step 4: Get the access-token from the json response, copy it to .env file
print("\n\nResult: Copy the access_token to your .env file as 'GITHUB_ACCESS_TOKEN='")
print("\n".join([f"{key}: {value}" for key, value in json_response.items()]))
