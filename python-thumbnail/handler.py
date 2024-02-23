from datetime import datetime
import boto3
from io import BytesIO
from PIL import Image, ImageOps
import os
import uuid
import json

s3 = boto3.client('s3')
size = int(os.environ['THUMBNAIL_SIZE'])
dynamodb = boto3.resource(
    'dynamodb', region_name=str(os.environ['REGION_NAME']))
db_table = str(os.environ['DYNAMODB_TABLE'])


def get_s3_image(bucket, key):
    print("Bucket: ", bucket)
    print("Key: ", key)
    response = s3.get_object(Bucket=bucket, Key=key)
    image_content = response['Body'].read()
    file = BytesIO(image_content)
    img = Image.open(file)
    return img


def image_to_thumbnail(image):
    return ImageOps.fit(image, (size, size), Image.ANTIALIAS)


def new_filename(key):
    parts = key.rsplit('.', 1)
    return f"{parts[0]}_thumbnail.png"


def upload_to_s3(bucket, key, thumbnail, img_size):
    out_thumb = BytesIO()
    thumbnail.save(out_thumb, 'PNG')
    out_thumb.seek(0)
    response = s3.put_object(
        ACL='public-read',
        ContentType='image/png',
        Body=out_thumb,
        Bucket=bucket,
        Key=key
    )

    print(response)

    url = '{}/{}/{}'.format(s3.meta.endpoint_url, bucket, key)

    save_thumbnail_url_to_db(url, img_size)

    return url


def save_thumbnail_url_to_db(url, img_size):
    toint = float(img_size * 0.53) / 1000
    table = dynamodb.Table(db_table)
    response = table.put_item(
        Item={
            'id': str(uuid.uuid4()),
            'url': str(url),
            'approximate_size': str(toint) + ' KB',
            'created_at': str(datetime.now()),
            'updated_at': str(datetime.now()),
        }
    )
    return {
        "statusCode": 200,
        "headers": {'Content-Type': 'application/json'},
        "body": json.dumps(response)
    }


def s3_thumbnail_generator(event, context):
    print("[EVENT]: ", event)

    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    img_size = event['Records'][0]['s3']['object']['size']

    if (not key.endswith('_thumbnail.png')):
        image = get_s3_image(bucket, key)
        thumbnail_key = new_filename(key)
        thumbnail = image_to_thumbnail(image)
        thumbnail_url = upload_to_s3(
            bucket,
            thumbnail_key,
            thumbnail,
            img_size
        )

        return thumbnail_url
    return {"statusCode": 200, "body": json.dumps("Thumbnail already exists")}


def list_thumbnails(event, context):
    table = dynamodb.Table(db_table)
    response = table.scan()
    items = response['Items']

    while 'LastEvaluatedKey' in response:
        response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        items.extend(response['Items'])

    return {
        "statusCode": 200,
        "headers": {'Content-Type': 'application/json'},
        "body": json.dumps(items),
    }


def get_thumbnail(event, context):
    table = dynamodb.Table(db_table)
    response = table.get_item(
        Key={'id': event['pathParameters']['id']}
    )
    return {
        "statusCode": 200,
        "headers": {'Content-Type': 'application/json'},
        "body": json.dumps(response['Item'])
    }


def delete_thumbnail(event, context):
    table = dynamodb.Table(db_table)
    response = table.delete_item(
        Key={'id': event['pathParameters']['id']}
    )

    if response['ResponseMetadata']['HTTPStatusCode'] == 200:
        return {
            "statusCode": 200,
            "headers": {'Content-Type': 'application/json'},
            "body": json.dumps(response)
        }
    else:
        return {
            "statusCode": 500,
            "headers": {'Content-Type': 'application/json'},
            "body": json.dumps(response)
        }
