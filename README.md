## FeatherDB: a database of indian birds

### Data collection 

- navigate to ./DataCollector
- run **python3 getBatch.py** ( This will display batches of bird names )
- Pick a batch and put the species on the prompt  ( refer below ) to generate data
- once done use the script to insert data 
- run the **insertBirds()** function via the route, comment once done ;
- use **./run.dev.sh**


DEPLOYED URL: https://featherbase.onrender.com/v1.0/birds/50


## PROMPT

```
You are an expert ornithologist and I want your help to create a Database of Indian bird species consisting of the following table

Format of the JSON objects:
- Name.
- Scientific_Name.
- IUCN_status:  which will include codes like (like: EX , EW , CR, EN, VU, NT, LC ).
- Habitat: example (like: woodland, desert, sea, wetland, grassland ).
- Distribution_Range_Size: (among_these: very large, moderate, large, restricted )
- Best_seen_at: (like: which state/region/national park/sanctuary in India there is report of good sighting seen/found  ).
- Migration_status : ( resident, local migration, foreign ).
- Order:  ( order of the species based on scientific name ).
- Family:  (family of the species based on scientific name).
- common_grouping (like: ducks / megapodes / cuckoos ) 
- Rarity: rarity of the species based on distribution and sighting  ( 1 to 5 ) 1 being common and 5 being super rare.
- How_to_identify:  ( male, female distinction, unique features and characteristics that will help ID the species ).
- Primary_colors_of_the_bird: ( example: A Shikra is ashy-blue-grey with orange accents ).
- Size_of_the_bird: ( tiny, small, medium large +  provide size in cm if possible ).
- Diet

Please provide accurate information only in JSON format and no other text, as i need this for scientific purpose 

Provide it for the following bird species :  
Grey-headed fish eagle
White-eyed buzzard
Rufous-winged buzzard
Grey-faced buzzard
Rough-legged buzzard
Upland buzzard
Himalayan buzzard
Long-legged buzzard
Common buzzard
Eastern barn owl


lets say one example of the data will look like :      {
        "Name": "Red-breasted Merganser",
        "Scientific_Name": "Mergus serrator",
        "IUCN_status": "LC",
        "Habitat": "coastal waters, large rivers",
        "Distribution_Range_Size": "very large",
        "Best_seen_at": "Coastal areas of India during winter",
        "Migration_status": "foreign",
        "Order": "Anseriformes",
        "Family": "Anatidae",
        "common_grouping": "ducks",
        "Rarity": 3,
        "How_to_identify": "Males with dark head and red breast, females with grey body and reddish head and neck.",
        "Primary_colors_of_the_bird": "Black, red, grey",
        "Size_of_the_bird": "medium, 52-58 cm",
        "Diet": "Fish, aquatic invertebrates"
    }
```