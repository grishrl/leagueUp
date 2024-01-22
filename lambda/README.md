# Lambda functions for ngs-mean-core

## Setup

-   Set up a custom IAM policy. This should include S3 permissions to read/write whatever buckets you need.
-   Create an IAM role.
-   Make sure lambda is allowed to use that role.
-   Attach the custom policy to the new role.
-   Attach the built-in policy `AWSLambdaBasicExecutionRole` to the new role. This will enable logging to Cloudwatch.
-   Use the new role as the exection role for the lambda.
-   The handler for the lamdba should be `handlers.foo`, where `foo` is the name of the function you
    want to run. See `handlers.js` for a list of the available functions.
-   Make sure the timeout for the function is long enough. 3 seconds is the default and 15 minutes is the maximum allowed.
-   Make sure the memory allocated to the function is enough. 128 MB is the default.
-   Configure any environment variables required by your function.

The trust relationship for the role should look like this:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

A sample policy for the role could look like this:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "List files in bucket",
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::rackham-ngs-public"
        },
        {
            "Sid": "write files in bucket",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::rackham-ngs-public/*"
        },
        {
            "Sid": "Read files in other bucket",
            "Effect": "Allow",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::ngs-replay-storage/*"
        }
    ]
}
```

## Deployment

To deploy new versions to lambda:

-   Run `npm run zip`. You will need to have zip installed on your development machine.
-   Upload the file `ngsLambda.zip` to the lambda.
