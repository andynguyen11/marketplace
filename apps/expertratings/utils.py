# from dicttoxml import dicttoxml
import lxml.etree as et
import xmltodict
from io import BytesIO

def upper_camel_case(value):
    def camelcase(): 
        while True:
            yield str.capitalize
    c = camelcase()
    return "".join(c.next()(x) if x else '_' for x in value.split("_"))


def xml_to_body_str(xml_element):
    root = et.ElementTree(xml_element)
    with BytesIO() as f:
        root.write(f, encoding='utf-8', xml_declaration=True, pretty_print=True) 
        return f.getvalue()


def buildxml(r, d):
    """ transforms a dict into an xml tree with leaf nodes as attributes
        {'auth': {'pass': 'word', 'user': 'name' }} #=>
        <auth pass="word" user="name"></auth>
    """
    if isinstance(d, dict):
        for k, v in d.iteritems():
            if isinstance(v, tuple) or isinstance(v, list) or isinstance(v, dict):
                s = et.SubElement(r, k)
                buildxml(s, v)
            else: r.set(k, unicode(v))
    elif isinstance(d, tuple) or isinstance(d, list):
        for v in d:
            s = et.SubElement(r, 'i')
            buildxml(s, v)
    elif isinstance(d, basestring):
        r.text = d
    else:
        r.text = str(d)
    return r


def dict2xml(d, name=None):
    if name is None and len(d.keys()) == 1:
        name = d.keys()[0]
        d = d[name]
    if name is None:
        raise TypeError('xml document must have a root name or a single root key')
    r = et.Element(name)
    return buildxml(r, d)

def xml2dict(string):
    return xmltodict.parse(string)


def xml_body(d):
    return xml_to_body_str(dict2xml(d))


