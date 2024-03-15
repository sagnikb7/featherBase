import pandas as pd
df = pd.read_excel("StateIndiaBirds.xlsx",sheet_name="Information")

batch = 1
batchCount = 1

for name in df['Common Name (India Checklist)']:
    if(batchCount == 1):
        print("\n Batch: {}".format(batch))
    print(name)
    batchCount+=1
    if(batchCount > 5):
         batchCount = 1
         batch+=1


