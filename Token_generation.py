import jwt
import datetime

# Replace with your secret key (keep this private and safe)
JWT_SECRET = 'mySuperSecretKey'

# Define the payload (this contains the data you want to encode in the token)
payload = {
    "user": "drone-client-1",  # Example user identifier
    "role": "telemetry-sender",  # Example role
    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expiration (1 hour from now)
}

# Generate the JWT token
token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')

# Print the generated token
print("Generated JWT Token:", token)
