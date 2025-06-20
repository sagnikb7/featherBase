import pandas as pd

# def getBatch():

#     batch = 1
#     batchCount = 1
#     df = pd.read_excel("StateIndiaBirds.xlsx",sheet_name="Information")


#     for name in df['Common Name (India Checklist)']:
#         if(batchCount == 1):
#             print("\n Batch: {}".format(batch))
#         print(name)
#         batchCount+=1
#         if(batchCount > 5):
#             batchCount = 1
#             batch+=1


def getBirdBatch():
    batch = 1
    batchCount = 1
    batchSize = 10

    data = pd.read_csv('output_wikipedia.csv')

    for name in data['common_name']:
        if(batchCount == 1):
            print("\n Batch: {} ({}-{})".format(batch,((batch-1) * batchSize)+1,batch*batchSize))
        print(name)
        batchCount+=1
        if(batchCount > batchSize):
            batchCount = 1
            batch+=1  


getBirdBatch()