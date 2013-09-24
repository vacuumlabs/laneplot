<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html
        PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <title>LanePlot DEMO</title>
    <link rel="stylesheet" href="css/laneplot.css" type="text/css" media="screen"/>
    <script type="text/javascript" src="js/jquery-1.10.2.js"></script>
    <script type="text/javascript" src="js/d3.js"></script>
    <script type="text/javascript" src="js/laneplot.js"></script>
    <style type="text/css">
        #demo {
            border: 1px solid #DEDEF9;
        }

        .red {
            background: red;
        }

        .blue {
            background: blue;
        }
    </style>
</head>
<body>
<h1>LanePlot DEMO</h1>
<script type="text/javascript">
    var testData = [
        {
            "id": "#lane1",
            "description": "Label #1",
            "items": [
                {
                    "startDate": "2013 04 05",
                    "endDate": "2013 10 05",
                    "progressDate": "2013 08 05",
                    "classes": ["red"],
                    "label": "Robitussin"
                },
                {
                    "startDate": "2013 07 12",
                    "endDate": "2013 08 30",
                    "progressDate": "2013 08 30",
                    "classes": ["blue"],
                    "label": "Diazepam"
                }
            ]
        },
        {
            "id": "#lane2",
            "description": "Label #2",
            "items": [
                {
                    "startDate": "2013 04 15",
                    "endDate": "2013 11 04",
                    "progressDate": "2013 06 05",
                    "classes": ["red"],
                    "label": "Robitussin 2"
                },
                {
                    "startDate": "(2013 06 06",
                    "endDate": "2013 06 20",
                    "progressDate": "2013 06 16",
                    "classes": ["blue"],
                    "label": "Diazepam 2"
                }
            ]
        },
        {
            "id": "#lane3",
            "description": "Long Label #3 Long Label #3 Long Label #3 Long Label #3",
            "items": [
                {
                    "startDate": "2013 04 15",
                    "endDate": "2013 11 04",
                    "progressDate": "2013 06 05",
                    "classes": ["red"],
                    "label": "Robitussin 3"
                },
                {
                    "startDate": "2013 06 06",
                    "endDate": "2013 06 20",
                    "progressDate": "2013 06 16",
                    "classes": ["blue"],
                    "label": "Diazepam 3"
                }
            ]
        },
        {
            "id": "#lane4",
            "description": "Label #4",
            "items": [
                {
                    "startDate": "2013 04 15",
                    "endDate": "2013 11 04",
                    "progressDate": "2013 06 05",
                    "classes": ["red"],
                    "label": "Robitussin 4"
                },
                {
                    "startDate": "2013 06 06",
                    "endDate": "2013 06 20",
                    "progressDate": "2013 06 16",
                    "classes": ["blue"],
                    "label": "Diazepam 4"
                }
            ]
        }
    ];


    // on ready
    $(function () {
        // create lanePlot
        $("#demo").lanePlot({
            data: testData,
            settings: {
                boundaries: {
                    startDate: "2013 03 05",
                    endDate: "2013 10 15"
                },
                viewport: {
                    width: 604800000,
                    position: null
                },
                laneHeight: 5
            },
            onLaneClick: function (event, lane) {
                alert('klikol si na ' + lane.id);
            }
        });
    })
    ;
</script>

<div id="demo"></div>
</body>
</html>