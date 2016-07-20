
tab_types = [ '%sTabs' %s for s in [
    'text',
    'title',
    'approve',
    'checkbox',
    'company',
    'fullName',
    'dateSigned',
    'date',
    'decline',
    'email',
    'emailAddress',
    'envelopeId',
    'firstName',
    'formula',
    'initialHere',
    'lastName',

    'list',
    'note',
    'number',
    'radioGroup',
    'signHere',
    'signerAttachment',
    'ssn',
    'zip',
]]

TAB_TYPES = tuple((tab, tab) for tab in tab_types)

tab_label_map = { label: label for label in tab_types }

def classify(tabs_dict, tab):
    type = tab.pop('type', tab_label_map.get(tab['tabLabel'], 'textTabs'))
    tabs_dict[type] = tabs_dict.get(type, [])
    tabs_dict[type].append(tab)
    return tabs_dict


def normalize(tabs_dict):
    tab_set = {}
    for k, tab_list in tabs_dict.items():
        for tab in tab_list:
            tab_set[k + tab['tabLabel']] = dict(type=k, label=tab['tabLabel'])
    return tab_set.values()
