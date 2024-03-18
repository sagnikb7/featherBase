from bs4 import BeautifulSoup
import requests

def dibird_extract():


    with open('bird.html', 'r') as file:
        html_content = file.read()
    soup = BeautifulSoup(html_content, 'html.parser')

    # Find all elements with class "species-name"
    species_elements = soup.find_all('span', class_='species-name')  

    # Process each element
    for element in species_elements:
        # Get the first child span (assuming there's always one)
        first_span = element.find('span')
        
        # Check if first_span is not None (avoid errors if missing)
        if first_span:
            # Extract text from the first span
            text = first_span.text.strip()
            print(text)  # Print the extracted text

def wikiExtract():

    url = "https://en.wikipedia.org/wiki/List_of_birds_of_India"

    # Make a request to the webpage (not recommended for real use)
    response = requests.get(url)

    # Parse the HTML content
    soup = BeautifulSoup(response.content, 'html.parser')

    # Find the table with bird species (structure might change, making this unreliable)
    bird_tables = soup.find_all('table', class_='wikitable')

    for bird_table in bird_tables:
        bird_rows = bird_table.find_all('tr')  # Assuming rows have bird names
        for row in bird_rows[1:]:  # Skip header row (assuming first row is header)
            species_cells = row.find_all('td')  # Assuming bird names are in first column (unreliable)
            print(species_cells[0].text.strip(),",",species_cells[1].text.strip())  # Extract and print text (unreliable)
    else:
        print("Table with bird species not found.")


# wikiExtract()
        