/*
* main application
*/
var App = Marionette.Application.extend({
	initialize: function(options) {
		this.config = options.config;
        this.addRegions({
							workoutTableRegion: "#workouts_table_container"
						});
		
	},
	start : function(){
        this.workoutsController = new App.WorkoutsController({isLocal: (this.config.env === 'local')});
	}
});

/*
* Models
*/
App.Workout = Backbone.Model.extend({
	parse: function(response){
		response.formatted_date = response.date;
		if(response.lbs){
			response.formatted_weight = response.weight + 'lbs';
		}
		else{
			response.formatted_weight = response.weight + 'kg';
		}
		return response;
	}
});

App.WorkoutsCollection = Backbone.Collection.extend({
	initialize: function(options){
		this.isLocal = options.isLocal;
	},
	model: App.Workout,
	url: function(){
		if(this.isLocal){
			return 'http://localhost:3000/api/workouts';
		}
		return 'http://52.24.46.168:3000/api/workouts';
	},
	parse: function(response) {
    	return response.data;
  	}
});

/*
* Views
*/
App.WorkoutItemView = Marionette.ItemView.extend({
  tagName : 'tr',
  className : 'workout_row',
  attributes: function(){return {'data-id': this.model.id};},
  template: function(data){ 
        var template = Marionette.TemplateCache.get('#workout-item-template');
  		return  template({model: data});
	}
});

App.WorkoutsCompositeView = Marionette.CompositeView.extend({
	tagName: 'table',
	id: 'workouts_table',
	template: '#workouts-table-template',
	childViewContainer: 'tbody',
	childView: App.WorkoutItemView
});


/*
* Controllers
*/
App.WorkoutsController = function(options){
	this.workouts = new App.WorkoutsCollection({isLocal: options.isLocal});
	var controller = this; //save reference to this
	//load workouts on page load
	var promise = this.workouts.fetch();
	promise.done(function(){
		controller.workoutsView = new App.WorkoutsCompositeView({collection: controller.workouts});
		app.workoutTableRegion.show(controller.workoutsView);
		//add listeners for edit and delete button
		$(app.workoutTableRegion.el).on('click', '.delete-button', function(event) {
			event.preventDefault();
			var parent = $(this).closest('tr');
			var workout_id = parent.data('id');
			parent.remove(); //remove from DOM
			//remove from workouts
			controller.workouts.get(workout_id).destroy();
		});

	});
};



/*
* Bootstrap app
*/

var app = new App({ config:  {env: 'local'}    });
app.start();

