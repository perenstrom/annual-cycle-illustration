// Initialise the document and hide some stuff
$(function () {
	$('#output').hide();
	$('#output-json').hide();
	$('#btn-generate-json').hide();
});

// Event triggered when to-month, to-day or description is losing focus, validates the input
$( "#input" ).on( "blur", ".validate", function(){
	var formRow = $(this).closest(".form-row");
	var rowID = parseInt(formRow.attr('id').replace(/form-row-(\d)-/, ''));
	var levelID = parseInt(formRow.attr('id').replace(/form-row-(\d)-\d/, '$1'));

	console.log("validate: " + levelID + ": " + rowID);
	if($(this).hasClass('description')){
		validateRow(levelID, rowID);
	} else {
		validateRow(levelID, rowID, false);
	}

});

// Function to validate the dates of a row
function validateRow(levelID, rowID, validateDescription){

	if (typeof validateDescription === 'undefined'){
		validateDescription = true;
	}

	console.log("Validate description: " + validateDescription);

	var formRow = $("#form-row-" + levelID + "-" + rowID);

	var fromMonth = parseInt($(formRow).find(".frommonth").val());
	var toMonth = parseInt($(formRow).find(".tomonth").val());

	var fromDay = parseInt($(formRow).find(".fromday").val());
	var toDay = parseInt($(formRow).find(".today").val());

	var description = $(formRow).find(".description").val();

	var frommonthWrap = $(formRow).find(".frommonth-wrap");
	var tomonthWrap = $(formRow).find(".tomonth-wrap");
	var fromdayWrap = $(formRow).find(".fromday-wrap");
	var todayWrap = $(formRow).find(".today-wrap");
	var descriptionWrap = $(formRow).find(".description-wrap");

	var error;

	if(rowID > 1){
		var previousRowID = rowID - 1;
		var previousFormRow = $("#form-row-" + levelID + "-" + previousRowID);
		var previousToDay = parseInt($(previousFormRow).find(".today").val());
		var previousToMonth = parseInt($(previousFormRow).find(".tomonth").val());

		// If the start month is earlier than the previous end month
		if(fromMonth < previousToMonth){
			frommonthWrap.addClass('has-error');
			error = true;
		} else {
			frommonthWrap.removeClass('has-error');
		}

		// If the start day is earlier than the previous end day
		if(fromMonth == previousToMonth && fromDay < previousToDay){
			fromdayWrap.addClass('has-error');
			error = true;
		} else {
			fromdayWrap.removeClass('has-error');
		}
	}

	// If the end month is earlier than the from month
	if(toMonth < fromMonth){
		tomonthWrap.addClass('has-error');
		error = true;
	} else {
		tomonthWrap.removeClass('has-error');
	}

	// If the end day is earlier than the from day
	if(toMonth == fromMonth && toDay < fromDay){
		todayWrap.addClass('has-error');
		error = true;
	} else {
		todayWrap.removeClass('has-error');
	}

	// Check if description is set
	console.log("Description: " + description);
	if(!description && validateDescription){
		descriptionWrap.addClass('has-error');
		error = true;
	} else {
		descriptionWrap.removeClass('has-error');
	}

	if(error){
		if(! $(formRow).find(".error-label").length){
			descriptionWrap.after('<span class="label label-danger error-label">Något är fel på den här raden</span>');
		}
		return false;
	} else {
		var errorLabel = $(formRow).find(".error-label");
		frommonthWrap.removeClass('has-error');
		tomonthWrap.removeClass('has-error');
		fromdayWrap.removeClass('has-error');
		todayWrap.removeClass('has-error');
		descriptionWrap.removeClass('has-error');
		errorLabel.remove();
		return true;
	}
};

var data = [];
var series = [];
var colors = ["#7fd25e","#ffe889", "#ff6e6e"];

// Generate the chart from JSON data
$("#btn-generate-from-json").click(function(){
	var title = $("#cycle-title").val();
	console.log("generate json");
	var seriesstring = $("#textarea-json").val();
	series = JSON.parse(seriesstring);
	$('#output').show();
	$('#btn-generate-json').show();
	generateChart(series, title);
});

// Generate the chart from date-data
$("#btn-generate").click(function(){

	console.log("Anropar initialiseSeries");

	data = [];
	series = [];
	initialiseSeries();

	var title = $("#cycle-title").val();

	$(".level-container").each(function(i){
		console.log("Loopar level-container: " + i);
		var nextstart = 1;
		data = [];
		var totalDays = 31 * 12;
		var level = i + 1;

		$("#level-" + level + " .form-row").each(function(i){
			console.log("Loopar form-row: " + i);
			var frommonth = parseInt($(this).find(".frommonth").val());
			var fromday = parseInt($(this).find(".fromday").val());
			var tomonth = parseInt($(this).find(".tomonth").val());
			var today = parseInt($(this).find(".today").val());

			var description = $(this).find(".description").val();

			var startday = ((frommonth - 1) * 31) + fromday;
			var endday = ((tomonth - 1) * 31) + today;

			var size = endday - startday + 1;

			var itemcolor = colors[level - 1];

			if(startday != nextstart){
				var hiddensize = startday - nextstart;

				data.push({
					name:'Hidden',
					y:hiddensize,
					visible: false
				});
			}

			data.push({
				name: description,
				y:size,
				color: itemcolor
			});

			nextstart = endday + 1;

			console.log(startday + " - " + endday + ". Size: " + size);
		});

		if(nextstart - 1 != totalDays){

			var hiddensize = totalDays - (nextstart - 1);

			data.push({
				name:'Hidden',
				y:hiddensize,
				visible: false
			});
		}

		console.log("Data för nivån klart:");
		console.log(data);

		var pieSizeNum = 55 + i * 7;
		var pieInnerSizeNum = 90 + i;

		var pieSize = pieSizeNum.toString() + "%";
		var pieInnerSize = pieInnerSizeNum.toString() + "%";

		var object = {
			name: 'Events ' + level,
			data: data,
			size: pieSize,
			innerSize: pieInnerSize
		};

		console.log(object);
		console.log("test");

		series.push(object);

	});

	$('#output').show();
	$('#btn-generate-json').show();

	generateChart(series, title);
});

function initialiseSeries(){
	var initialObject = {
		name: 'Månader',
		data: [
			{
				name:'Jan',
				y:31,
				color: "#e1f5ff"
			},
			{
				name:'Feb',
				y:31,
				color: "#8ed6f9"
			},
			{
				name:'Mar',
				y:31,
				color: "#e1f5ff"
			},
			{
				name:'Apr',
				y:31,
				color: "#8ed6f9"
			},
			{
				name:'Maj',
				y:31,
				color: "#e1f5ff"
			},
			{
				name:'Jun',
				y:31,
				color: "#8ed6f9"
			},
			{
				name:'Jul',
				y:31,
				color: "#e1f5ff"
			},
			{
				name:'Aug',
				y:31,
				color: "#8ed6f9"
			},
			{
				name:'Sep',
				y:31,
				color: "#e1f5ff"
			},
			{
				name:'Okt',
				y:31,
				color: "#8ed6f9"
			},
			{
				name:'Nov',
				y:31,
				color: "#e1f5ff"
			},
			{
				name:'Dec',
				y:31,
				color: "#8ed6f9"
			}
		],
		dataLabels: {distance: -23},
		enableMouseTracking: false,
		size: '48%',
		innerSize: '60%'
	};
	series.push(initialObject);
}

// Generate the chart based on input data
function generateChart(series, title){

	// Create the chart
	$('#chartcontainer').highcharts({
		chart: {
			type: 'pie'
		},
		title: {
			text: title
		},
		yAxis: {
			title: {
				text: ''
			}
		},
		plotOptions: {
			pie: {
				shadow: false,
				ignoreHiddenPoint: false,
				center: ['50%', '50%']
			}
		},
		tooltip: {
			valueSuffix: '%'
		},
		series: series
	});
};

// Export the JSON
$("#btn-generate-json").click(function(){
	$("#output-json").show();
	$("#output-json").html('<div class="row"><div class="col-md-12"><pre>' + JSON.stringify(series, null, '\t') + '</pre></div></div>');
});

// Add an input row
$( "#input" ).on( "click", "button.btn-add-row", function() {

	var levelContainer = $(this).closest(".level-container");

	var levelID = parseInt(levelContainer.attr('id').replace(/level-/, ''));

	var lastRow = levelContainer.find(".last-row");

	var rowID = parseInt(lastRow.attr('id').replace(/form-row-(\d)-/, ''));
	var newid = rowID + 1;

	var descriptionJQ = lastRow.find(".description");
	var description = descriptionJQ.val();

	var descriptionWrapJQ = lastRow.find(".description-wrap");

	console.log(description);

	if(validateRow(levelID, rowID)){
		lastRow.removeClass('last-row');

		lastRow.after(' \
			<div class="row form-row last-row top-buffer" id="form-row-' + levelID + '-' + newid + '"> \
				<div class="col-md-12"> \
					<div class="form-group frommonth-wrap"> \
						<select class="form-control frommonth validate"> \
							<option value="1">Januari</option> \
							<option value="2">Februari</option> \
							<option value="3">Mars</option> \
							<option value="4">April</option> \
							<option value="5">Maj</option> \
							<option value="6">Juni</option> \
							<option value="7">Juli</option> \
							<option value="8">Augusti</option> \
							<option value="9">September</option> \
							<option value="10">Oktober</option> \
							<option value="11">November</option> \
							<option value="12">December</option> \
						</select> \
					</div> \
					<div class="form-group fromday-wrap"> \
						<select class="form-control fromday validate"> \
							<option value="1">1</option> \
							<option value="2">2</option> \
							<option value="3">3</option> \
							<option value="4">4</option> \
							<option value="5">5</option> \
							<option value="6">6</option> \
							<option value="7">7</option> \
							<option value="8">8</option> \
							<option value="9">9</option> \
							<option value="10">10</option> \
							<option value="11">11</option> \
							<option value="12">12</option> \
							<option value="13">13</option> \
							<option value="14">14</option> \
							<option value="15">15</option> \
							<option value="16">16</option> \
							<option value="17">17</option> \
							<option value="18">18</option> \
							<option value="19">19</option> \
							<option value="20">20</option> \
							<option value="21">2</option> \
							<option value="22">22</option> \
							<option value="23">23</option> \
							<option value="24">24</option> \
							<option value="25">25</option> \
							<option value="26">26</option> \
							<option value="27">27</option> \
							<option value="28">28</option> \
							<option value="29">29</option> \
							<option value="30">30</option> \
							<option value="31">31</option> \
						</select> \
					</div> \
					<div class="form-group"> \
						<p>-</p> \
					</div> \
					<div class="form-group tomonth-wrap"> \
						<select class="form-control tomonth validate"> \
							<option value="1">Januari</option> \
							<option value="2">Februari</option> \
							<option value="3">Mars</option> \
							<option value="4">April</option> \
							<option value="5">Maj</option> \
							<option value="6">Juni</option> \
							<option value="7">Juli</option> \
							<option value="8">Augusti</option> \
							<option value="9">September</option> \
							<option value="10">Oktober</option> \
							<option value="11">November</option> \
							<option value="12">December</option> \
						</select> \
					</div> \
					<div class="form-group today-wrap"> \
						<select class="form-control today validate"> \
							<option value="1">1</option> \
							<option value="2">2</option> \
							<option value="3">3</option> \
							<option value="4">4</option> \
							<option value="5">5</option> \
							<option value="6">6</option> \
							<option value="7">7</option> \
							<option value="8">8</option> \
							<option value="9">9</option> \
							<option value="10">10</option> \
							<option value="11">11</option> \
							<option value="12">12</option> \
							<option value="13">13</option> \
							<option value="14">14</option> \
							<option value="15">15</option> \
							<option value="16">16</option> \
							<option value="17">17</option> \
							<option value="18">18</option> \
							<option value="19">19</option> \
							<option value="20">20</option> \
							<option value="21">2</option> \
							<option value="22">22</option> \
							<option value="23">23</option> \
							<option value="24">24</option> \
							<option value="25">25</option> \
							<option value="26">26</option> \
							<option value="27">27</option> \
							<option value="28">28</option> \
							<option value="29">29</option> \
							<option value="30">30</option> \
							<option value="31">31</option> \
						</select> \
					</div> \
					<div class="form-group description-wrap"> \
						<div class="form-group"> \
							<input type="text" class="form-control description validate" placeholder="Beskrivning"> \
						</div> \
					</div> \
				</div> \
			</div> \
		');
		console.log(rowID);
	}
});

// Add an input level
$("#btn-add-level").click(function(){

	var levelContainer = $(".last-level");

	var levelID = parseInt(levelContainer.attr('id').replace(/level-/, ''));
	var newLevel = levelID + 1;

	levelContainer.removeClass("last-level");

	levelContainer.after(' \
    	<div class="level-container last-level" id="level-' + newLevel + '"> \
			<div class="row"> \
				<div class="col-md-12"> \
					<h3>Nivå ' + newLevel + '</h3> \
				</div> \
			</div> \
			<form class="form-inline input-form" > \
				<div class="row form-row last-row" id="form-row-' + newLevel + '-1"> \
					<div class="col-md-12"> \
						<div class="form-group frommonth-wrap"> \
							<select class="form-control frommonth validate"> \
								<option value="1">Januari</option> \
								<option value="2">Februari</option> \
								<option value="3">Mars</option> \
								<option value="4">April</option> \
								<option value="5">Maj</option> \
								<option value="6">Juni</option> \
								<option value="7">Juli</option> \
								<option value="8">Augusti</option> \
								<option value="9">September</option> \
								<option value="10">Oktober</option> \
								<option value="11">November</option> \
								<option value="12">December</option> \
							</select> \
						</div> \
						<div class="form-group fromday-wrap"> \
							<select class="form-control fromday validate"> \
								<option value="1">1</option> \
								<option value="2">2</option> \
								<option value="3">3</option> \
								<option value="4">4</option> \
								<option value="5">5</option> \
								<option value="6">6</option> \
								<option value="7">7</option> \
								<option value="8">8</option> \
								<option value="9">9</option> \
								<option value="10">10</option> \
								<option value="11">11</option> \
								<option value="12">12</option> \
								<option value="13">13</option> \
								<option value="14">14</option> \
								<option value="15">15</option> \
								<option value="16">16</option> \
								<option value="17">17</option> \
								<option value="18">18</option> \
								<option value="19">19</option> \
								<option value="20">20</option> \
								<option value="21">2</option> \
								<option value="22">22</option> \
								<option value="23">23</option> \
								<option value="24">24</option> \
								<option value="25">25</option> \
								<option value="26">26</option> \
								<option value="27">27</option> \
								<option value="28">28</option> \
								<option value="29">29</option> \
								<option value="30">30</option> \
								<option value="31">31</option> \
							</select> \
						</div> \
						<div class="form-group"> \
							<p>-</p> \
						</div> \
						<div class="form-group tomonth-wrap"> \
							<select class="form-control tomonth validate"> \
								<option value="1">Januari</option> \
								<option value="2">Februari</option> \
								<option value="3">Mars</option> \
								<option value="4">April</option> \
								<option value="5">Maj</option> \
								<option value="6">Juni</option> \
								<option value="7">Juli</option> \
								<option value="8">Augusti</option> \
								<option value="9">September</option> \
								<option value="10">Oktober</option> \
								<option value="11">November</option> \
								<option value="12">December</option> \
							</select> \
						</div> \
						<div class="form-group today-wrap"> \
							<select class="form-control today validate"> \
								<option value="1">1</option> \
								<option value="2">2</option> \
								<option value="3">3</option> \
								<option value="4">4</option> \
								<option value="5">5</option> \
								<option value="6">6</option> \
								<option value="7">7</option> \
								<option value="8">8</option> \
								<option value="9">9</option> \
								<option value="10">10</option> \
								<option value="11">11</option> \
								<option value="12">12</option> \
								<option value="13">13</option> \
								<option value="14">14</option> \
								<option value="15">15</option> \
								<option value="16">16</option> \
								<option value="17">17</option> \
								<option value="18">18</option> \
								<option value="19">19</option> \
								<option value="20">20</option> \
								<option value="21">2</option> \
								<option value="22">22</option> \
								<option value="23">23</option> \
								<option value="24">24</option> \
								<option value="25">25</option> \
								<option value="26">26</option> \
								<option value="27">27</option> \
								<option value="28">28</option> \
								<option value="29">29</option> \
								<option value="30">30</option> \
								<option value="31">31</option> \
							</select> \
						</div> \
						<div class="form-group description-wrap"> \
							<div class="form-group"> \
								<input type="text" class="form-control description validate" placeholder="Beskrivning"> \
							</div> \
						</div> \
					</div> \
				</div> \
				<div class="row top-buffer"> \
					<div class="col-md-12"> \
						<button type="button" class="btn btn-info btn-add-row">Lägg till nytt datum</button> \
					</div> \
				</div> \
			</form> \
			<hr> \
		</div> \
	');

	if(newLevel >= 3){
		$("#btn-add-level").hide();
	}
});

// Remove any warnings when something is entered into the description field
$(".description-wrap").keypress(function() {
	$(this).removeClass('has-error');
});