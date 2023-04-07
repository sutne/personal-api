import base64


def format_url(url: str, args: dict = {}) -> str:
    result = url
    if args:
        result += "?" + "&".join([f"{k}={v}" for k, v in args.items()])
    return result


def format_curl(url: str, headers: dict = {}, args: dict = {}) -> str:
    curl = "curl -s -X POST"
    if headers:
        curl += " " + " ".join([f'-H "{k}: {v}"' for k, v in headers.items()])
    if args:
        curl += " -d " + "&".join([f"{k}={v}" for k, v in args.items()])
    return f"{curl} {url}"


def B64_string(string: str) -> str:
    return base64.b64encode(string.encode("ascii")).decode("ascii")
