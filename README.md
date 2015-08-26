

#Description
Easy to use Gantt chart jQuery plugin.

Developed for mediworx

Gantt chart is used to display one-time events and time-interval based 

Usable for displaying event collisions, event link-up, interval sequencing, 

or non-shareable resource allocation in relation to time.



To see Laneplot in action, visit http://vacuumlabs.github.io/laneplot/index.html

#Installation
To include LanePlot, include this code inside \<head> element of your page.

    <!-- LanePlot CSS -->
    <link rel="stylesheet" href="css/vacuumgantt.css" type="text/css" media="screen"/>
    <link rel="stylesheet" href="css/jquery.qtip.min.css" type="text/css" media="screen"/>
    <link rel="stylesheet" href="css/vacuumgantt-demo.css" type="text/css" media="screen"/>

    <!-- LanePlot JS -->
    <script type="text/javascript" src="js/jquery-1.10.2.js"></script>
    <script type="text/javascript" src="js/d3.js"></script>
    <script type="text/javascript" src="js/moment.min.js"></script>
    <script type="text/javascript" src="js/jquery.qtip.min.js"></script>
    <script type="text/javascript" src="js/vacuumgantt-1.2.js"></script>

#Use
To use LanePlot, first you have to setup the view.

	var settings = {
	       boundaries: {
	           startDate: '2013/02/12',
	           endDate: '2013/03/14'
	       },
	       viewport: {
	           width: 30 * 24 * 60 * 60 * 1000 //miliseconds
	       },
	       laneHeight: "30px",
	       grid: {
	           timelines: [{
	               resolution: 1000 * 60 * 60 * 24, //miliseconds
	               dateFormat: 'DD'
	           }]
	       }
	   }
                
Then enter the data

            var demo0Data = [
                {
                    "id": "#lane1",
                    "description": "Lane 1",
                    "items": [
                        {
                            "date": "2013/02/16",
                            "classes": [],
                            "label": "Event label 1",
                            "icon": "icons/dot.png" 
                        }
                    ]
                },
                {
                    "id": "#lane2",
                    "description": "Lane 2",
                    "items": [
                        {        
                            "startDate": "2013/02/14",
                            "endDate": "2013/02/20",
                            "progressDate": "2013/02/18",
                            "classes": ["green"],
                            "progressColor": ['#0A7610', '#00AF06'],
                            "unfinishedColor": ["#4C4C4C", "#7D7D7D"],
                            "label": "Interval 1",
                            "tooltip": "additional details",
                        }
                    ]
                }
            ]
            
Finally call vacuumGantt function on an placeholder object at any time. The function initialize the chart.

            $("#demo0").vacuumGantt({
                data: demo0Data,
                settings: settings,
                onLaneClick: ""
                onLaneError: ""
            });
        });

Beware, every time you call the vacuumGantt function, a new chart is appended.
####How to read:

* 	*emphasized*: optional entry
*	**strong**: mandatory entry


##Settings structure

*	*boundaries*: (if no entered: what is the default value?)
	*	*startDate*: date string
	*	*endDate*: date string
*	*intervalThreshold*: if interval is smaller than intervalThreshold, it is displayed as a one time event.
*	*eventsGroupClasses*: string : determines class for tooltip of grouped events
*	**viewport**:	
	*	**width**
	*	*position*
*	*grid*
	*	*color*: color of gridlines 
	*	*timelines*: array
		*	*resolution*: miliseconds representing one box of grid - physical dimensions
		*	*dateFormat*: date format according to moment.js
		*	*classes*: classes
	* 	*labelsWidth*
	* 	*laneHeight*
*	onLaneClick	(outside of settings)
*	onLaneError (outside of settings?)			


##Data structure
* 	Is a JSON array of **lane** objects

###Lane object
*	Consist of entries
	*	*id*: html id for further identification
	*	**description**: Arbitrary HTML rendered on the left side of the lane
	*	*icon*: Path to icon displayed before the lane label
	*	**items**: array of event objects

###Event object

There are two types of event objects: 

*	One time event
*	Interval event

General entries:

*	*classes*: Array of strings, rendered inside of class parameter of HTML tag representing event.
*	*icon*: Path to icon displayed before the event label
*	*tooltip*: Tooltip text
	*	default
		*	tooltip: "Tooltip text"
	*	custom
		*	tooltip: { 
			
			content: "Tooltip text",
			
			classes: "mycustomclass"
              
			}


####One time event specific entries
*	**date**: date string
*	*label*: Text displayed at the right side of event point.



####Interval event specific entries
*	**startDate**: date string,
*	**endDate**: date string,
*	*progressDate*: date string,
*	*cornerRadius*: integer defining the css border-radius
*	*arrow*: boolean determining if interval progress has arrow at the end
*	*progressColor*: color or gradient of interval part drawn between startDate and endDate (startDate and progressDate if progressDate is entered).
*	*unfinishedColor*: color or gradient of interval part between progressDate and endDate.
*	*label*: label to display inside interval.


#### Color/Gradient definition

*	solid color: #rrggbb - standard css color notation.
*	gradient: ["#rrggbb","#RRGGBB"] - array of two standard css color notations

#### Date String and Date Format definition
*	for date/time string processing, we used moment.js library.
	*	YYYY/MM/DD for date
	*	YYYY/MM/DD HH:MM:SS for datetime	
