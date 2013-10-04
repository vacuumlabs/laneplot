var testBoundaries = {
    startDate: "2013/07/31",
    endDate: "2013/10/01"
};
var testData = [
    {
        "id": "#hospitalizacia",
        "description": "<span class='greenLabel'>Hospitalizácia</span>",
        "icon": "icons/hosp.png",
        "items": [
            {
                "date": "2013/07/31",
                "classes": [],
                "icon": "icons/camera.png",
                "label": "EEG"
            },
            {
                "date": "2013/08/20",
                "classes": [],
                "icon": "icons/camera.png",
                "label": "CT Hlavy"
            }
        ]
    },
    {
        "id": "#ine",
        "description": "Iné vyšetrenia",
        "items": [
            {
                "date": "2013/08/02",
                "classes": [],
                "icon": "icons/note.png",
                "label": "X.100"
            },
            {
                "date": "2013/09/10",
                "classes": [],
                "icon": "icons/note.png",
                "label": "P279a"
            }
        ]
    },
    {
        "id": "#liekyA1",
        "description": "Lieky (typ <strong>A1</strong>)",
        "items": [
            {
                "startDate": "2013/08/28",
                "endDate": "2013/10/01",
                "progressDate": "2013/09/24",
                "classes": ["red"],
                "progressColor": ["#BF2101", "#FF2E00"],
                "unfinishedColor": ["#4C4C4C","#7D7D7D"],
                "label": "LOMAC, cps 14x20 mg"
            }
        ]
    },
    {
        "id": "#liekyA2",
        "description": "Lieky (typ <strong>A2</strong>)",
        "icon": "icons/warn.png",
        "items": [
            {
                "startDate": "2013/09/11",
                "endDate": "2013/10/01",
                "progressDate": "2013/09/24",
                "classes": ["red"],
                "progressColor": ["#BF2101", "#FF2E00"],
                "unfinishedColor": ["#4C4C4C","#7D7D7D"],
                "label": "LOMAC, cps 14x20 mg"
            }
        ]
    },
    {
        "id": "#liekyB",
        "description": "Lieky (typ <strong>B</strong>)",
        "items": [
            {
                "startDate": "2013/08/07",
                "endDate": "2013/08/28",
                "progressDate": "2013/08/28",
                "classes": ["green"],
                "progressColor": ['#0A7610','#00AF06'],
                "icon": "icons/folder.png",
                "label": "TARKA 240 mg/2 mg tablety"
            }
        ]
    },
    {
        "id": "#dlhodobe",
        "description": "Dlhodobé lieky",
        "items": [
            {
                "startDate": "2013/08/01",
                "endDate": "2013/09/05",
                "progressDate": "2013/09/05",
                "classes": ["green"],
                "progressColor": ['#0A7610','#00AF06'],
                "label": "Penbene, tbl flm 30x1 MU"
            }
        ]
    }
];