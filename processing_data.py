import json
import pandas

def read_json_file(filepath: str) -> dict:
    with open(filepath, 'r') as file:
        data = json.load(file)
    return data


def filter_data_from_json(data: dict) -> dict:
    filtered_data = {}
    for key, value in data.items():
        print(key, value)
        break


def main():
    data = read_json_file('/home/divyanshu.siwach/projects/cric/data/bbl_json/524915.json')
    filtered_data = filter_data_from_json(data)
    # print(filtered_data)

main()