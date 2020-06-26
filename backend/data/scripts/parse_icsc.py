import pdfminer.high_level as pdf_hl
import re
import string

def separate_contact_blocks(filename):
    # returns a set of tuples, split by contact group on the ICSC pdf document, then split by field, of which are:
    # [Name, Title, Company, Address1, Address2, Address3, City State Zip, Phone, Type]
    text = pdf_hl.extract_text(filename)
    return {tuple(item.split("\n")) for item in text.split("\n\n") if not ('MEETING ATTENDANCE LIST' or 'No part of this list') in item}

def contact_block_to_dict(block):
    # takes a contact block and turns it into a dictionary
    # example block: ('Andrew Corno', 'Senior Vice President', 'JLL', '3854 Beecher Street', 'Washington, DC 20007 United States', '(301) 520-2620', 'Real Estate Services')
    # example dict:
    #   {'first_name': 'Andrew',
    #   'last_name': 'Corno',
    #   'title': 'Senior Vice President',
    #   'company': 'JLL',
    #   'address_street': '3854 Beecher Street',
    #   'address_unit': None,
    #   'address_city_state': 'Washington, DC 20007 United States',
    #   'phone': '(301) 520-2620',
    #   'type': 'Real Estate Services'}

    if len(block) < 4:
        return None
    block = list(block)
    first, last = split_name(block.pop(0))
    contact_dict = {"first_name": first, "last_name": last, "title": None, "company": None, "address_street": None, "address_unit": None,
                    "address_city_state": None, "phone": None, "type": None}

    # assign name

    # assign address
    address_end = None
    for i in range(len(block)):
        if bool(re.search(r'\d{5}\sUnited\sStates', block[i])):
            address_end = i
            break

    if not address_end:
        return None

    address_start = None
    for i in reversed(range(address_end)):
        if bool(re.match(r'[\d\-]+[\s]+[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+', block[i])) or \
                ('pobox' in block[i].translate(str.maketrans('', '', string.punctuation)).lower().replace(" ","")):
            address_start = i
            break
    if not address_start:
        return None

    address_blocks = [block.pop(address_start) for i in range(address_start, address_end+1)]

    for i in range(len(address_blocks)):
        item = address_blocks.pop(0)
        if not contact_dict["address_street"] and (bool(re.match(r'[\d\-]+[\s]+[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+', item))
                                                   or ('pobox' in item.translate(str.maketrans('', '', string.punctuation)).lower().replace(" ",""))):
            contact_dict["address_street"] = item
        elif not contact_dict["address_city_state"] and "," in item:
            contact_dict["address_city_state"] = item
        elif "United States" in item and contact_dict["address_city_state"]:
            contact_dict["address_city_state"] = contact_dict["address_city_state"]+", "+item
        elif not contact_dict["address_unit"] and len(item)<=11:
            contact_dict["address_unit"] = item

    # find type
    last_item = block.pop()
    if bool(re.match(r'[\w\s]+', last_item)):
        contact_dict["type"] = last_item # TODO: potentially get rid of N/As
    elif re.match(r'[\d\(\)\s\-\,]+', last_item) and len(re.findall(r'\d', last_item))>10:
        contact_dict['phone'] = last_item

    # find phone
    last_item = block.pop()
    if bool(re.match(r'[\d\(\)\s\-\,]+', last_item)) and len(re.findall(r'\d', last_item))>=10:
        contact_dict['phone'] = last_item
    else:
        contact_dict['company'] = last_item

    # find company and title
    if len(block) > 1:
        contact_dict['title'] = block[0]
        contact_dict['company'] = block[1]
    elif len(block)>0 and contact_dict['company']:
        contact_dict['title']= block.pop(0)
    elif len(block)>0:
        contact_dict['company']= block.pop()

    return contact_dict

def split_name(name):
    first = name.split(",")[0].split(" ")[0]
    if bool(re.match("[A-Z]\.",first)): first = name.split(",")[0].split(" ")[1]
    last = name.split(",")[0].split(" ")[-1]
    return first, last


if __name__ == "__main__":
    def test_contact_block_to_dict():
        blocks = [('Andrew Corno', 'Senior Vice President', 'JLL', '3854 Beecher Street', 'Washington, DC 20007 United States',
                   '(301) 520-2620', 'Real Estate Services'),('Nate Tower', 'CEO and Founding Partner', 'Broad Reach Retail Partners, LLC',
                    '1111 Benfield Blvd', 'Suite 100', 'Millersville, MD 21108 United States', '(443) 621-6555', 'Owner/Developer'),
                  ('Susan Johnson', 'Real Estate Director', 'Hallmark Cards', '20131 Tailwind Lane', 'Cornelius, NC 28031 United States',
                   '704.987.5048', 'Retailer/Tenant'),('Jennifer Chagnon','Freeman Expositions','8301 Ambassador Road','Dallas, TX 75247 United States','N/A'),
                  ('Daniel Gold','Founding Partner','Future Energy Solutions','5400 NW 35 AVenue','Fort Lauderdale, FL 33309 United States',
                   'N/A','Utilities, Telecommunications and Other'), ('Matthew L. Mehring','Director of Real Estate','FOCUS Brands',
                    '8009 Maureen Drive','Cranberry Township, PA','16066 United States', '(615) 477-8725', 'Retailer/Tenant'), ('Matthew L. Mehring','Director of Real Estate','FOCUS Brands',
                    'P. O. Box Maureen Drive','Cranberry Township, PA','16066 United States', '(615) 477-8725', 'Retailer/Tenant')]

        print([contact_block_to_dict(block) for block in blocks])

    test_contact_block_to_dict()
    # print(separate_contact_blocks('/Users/colin/Downloads/2020MA_Attendees.pdf'))
