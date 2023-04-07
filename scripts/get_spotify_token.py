import os
import json
import dotenv
from util import format_url, format_curl, B64_string

# needs privilege to read the following
permissions = [
    "user-top-read",
    "user-read-currently-playing",
    "user-read-recently-played",
]
SCOPES = ",".join(permissions)

# Step 0: Load / set environment variables from spotify developer app settings
dotenv.load_dotenv(dotenv.find_dotenv())
SPOTIFY_CLIENT_ID = os.environ.get("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.environ.get("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = "http://localhost/callback/"

if not all([SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI]):
    print("An environment variable was not set")
    exit(0)


# Step 1: request user (me) to allow application to access data
print("Go to the following link:")
request_access_url = format_url(
    "https://accounts.spotify.com/authorize",
    args={
        "client_id": SPOTIFY_CLIENT_ID,
        "scope": SCOPES,
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "response_type": "code",
    },
)
print(f"\n{request_access_url}\n")


# Step 2: when complete, user is redirected to the redirect_uri with a code
print(f"You were redirected to '{SPOTIFY_REDIRECT_URI}?code=XXXXXXX'")
url_with_code = input("Paste the full URL (with code) here: ")
CODE = url_with_code.split("?code=")[1]


# Step 3: exchange code for refresh token
BASE64 = B64_string(f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}")
command = format_curl(
    "https://accounts.spotify.com/api/token",
    headers={
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {BASE64}",
    },
    args={
        "grant_type": "authorization_code",
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "code": CODE,
    },
)


# Step 4: Get the refresh token from the json response, copy it to .env file
json_response = json.loads(os.popen(command).read())
print("\n\nResults: Copy refresh_token to .env file as 'SPOTIFY_REFRESH_TOKEN='")
print("\n".join([f"{key}: {value}" for key, value in json_response.items()]))
