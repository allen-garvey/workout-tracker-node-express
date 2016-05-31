/*
* main application
*/
var App = Marionette.Application.extend({
	initialize: function(options) {
		this.config = options.config;
        this.addRegions({
							workoutTableRegion: "#workouts_table_container",
							workoutModalEditRegion: "#edit_modal_region"
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
	initialize: function(attributes){
		this.attributes.formatted_date = attributes.date;
		if(attributes.lbs){
			this.attributes.formatted_weight = attributes.weight + 'lbs';
		}
		else{
			this.attributes.formatted_weight = attributes.weight + 'kg';
		}
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

App.WorkoutItemEditView = Marionette.ItemView.extend({
  className : 'edit-workout-modal-container',
  attributes: function(){return {'data-id': this.model.id};},
  onRender: function(){
    $('.modal_overlay').show();
    $(this.el).find("input[type='date']").datepicker({"dateFormat": "yy-mm-dd"});
  },
  onDestroy: function(){
    $('.modal_overlay').hide();
  },
  template: function(data){ 
        var template = Marionette.TemplateCache.get('#workout-edit-form-template');
  		return  template({model: data});
	}
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
		
		//add listeners for delete button
		$(app.workoutTableRegion.el).on('click', '.delete-button', function(event) {
			event.preventDefault();
			var parent = $(this).closest('tr');
			var workout_id = parent.data('id');
			parent.remove(); //remove from DOM
			//remove from workouts
			controller.workouts.get(workout_id).destroy();
		});
		//add listeners for edit button
		$(app.workoutTableRegion.el).on('click', '.edit-button', function(event) {
			event.preventDefault();
			var parent = $(this).closest('tr');
			var workout_id = parent.data('id');
			var selectedWorkout = controller.workouts.get(workout_id);
			controller.editModal = new App.WorkoutItemEditView({model: selectedWorkout});
			app.workoutModalEditRegion.show(controller.editModal);
		});
		//add listeners for edit modal
		$(app.workoutModalEditRegion.el).on('click', '.cancel-button', function(event) {
			event.preventDefault();
			app.workoutsController.editModal.destroy();
		});
		//save edit
		$(app.workoutModalEditRegion.el).on('submit', 'form', function(event) {
			event.preventDefault();
			app.workoutsController.editModal.destroy();
		});
	});
};



/*
* Bootstrap app
*/

var app = new App({ config:  {env: 'local'}    });
app.start();


//add jquery ui datepicker to date inputs
(function($) {
	$("input[type='date']").datepicker({"dateFormat": "yy-mm-dd"});
})(jQuery);
