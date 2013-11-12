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
                "date": "2013/08/20",
                "classes": [],
                "icon": "icons/camera.png",
                "label": "CT Hlavy"
            },
            {
                "date": "2013/07/31",
                "classes": [],
                "icon": "icons/camera.png",
                "label": "EEG"
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
                "icon": "icons/dot.png",
                "label": "X.100"
            },
            {
                "date": "2013/08/08 10:00",
                "classes": [],
                "icon": "icons/dot.png",
                "label": "Vyšetrenie A"
            },
            {
                "date": "2013/08/15",
                "classes": [],
                "icon": "icons/dot.png",
                "label": "Vyšetrenie B"
            },
            {
                "date": "2013/08/09 02:00",
                "classes": [],
                "icon": "icons/dot.png",
                "label": "Vyšetrenie C",
                "tooltip" : "<strong>Vyšetrenie C</strong> extra info "
            }
        ]
    },
    {
        "id": "#liekyA1",
        "description": "Lieky (typ <strong>A1</strong>)",
        "items": [
            {
                "startDate": "2013/08/06 10:00",
                "endDate": "2013/08/06 18:00",
                "progressDate": "2013/08/06 18:00",
                "progressColor": "#F18200",
                "unfinishedColor": "#D4D4D4",
                "label": "Small Interval",
                "icon": "icons/dot.png",
                "cornerRadius": 10
            },
            {
                "startDate": "2013/08/28",
                "endDate": "2013/10/01",
                "progressDate": "2013/09/24",
                "classes": ["red"],
                "progressColor": "#F18200",
                "unfinishedColor": "#D4D4D4",
                "label": "LOMAC, cps 14x20 mg",
                "cornerRadius": 10
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
                "progressColor": "#F18200",
                "unfinishedColor": "#D4D4D4",
                "label": "LOMAC, cps 14x20 mg",
                "cornerRadius": 10
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
                "progressColor": "#8CB302",
                "icon": "icons/folder.png",
                "label": "TARKA 240 mg/2 mg tablety",
                "cornerRadius": 10
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
                "progressColor": "#8CB302",
                "label": "Penbene, tbl flm 30x1 MU",
                "cornerRadius": 10
            }
        ]
    }
];