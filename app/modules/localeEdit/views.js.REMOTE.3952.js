define([
  'app',
  'LocaleEdit',
  'backbone',
  'Mediator'
],

function(app, LocaleEdit,  Backbone) {

  var Views = {};
  var mediator = new Mediator();

  Views.Upload = Backbone.View.extend({
    template: 'app/templates/localeedit/upload',
    tagName: 'div',
    manage: true
   });

  Views.Overview = Backbone.View.extend({
    template: 'app/templates/localeedit/overview',
    manage: true
   });

  Views.EditFilter = Backbone.View.extend({
        events: {
      "keyup #keySearchTask" : "KeySearch",
      "click #nextPage" : "NextPage",
      "click #prevPage" : "PrevPage",
      "click #gotoStart" : "goToStart",
      "click #gotoEnd" : "goToEnd",
      "change #SelElementsPerPage" : "changeElementsPerPage"
    },

    goToStart: function(e){
      mediator.Publish('goToStart');
        return this;
    },    

    goToEnd: function(e){
      mediator.Publish('goToEnd');
        return this;
    },   
    changeElementsPerPage: function(){

      var elementsPerPage = $("#SelElementsPerPage").val();
      this.elementsPerPage = elementsPerPage;
      mediator.Publish('elementsPerPageCHanged', elementsPerPage);
        return this;      
    },
    NextPage: function(e){
      mediator.Publish('nextpage');
        return this;
    },    
    PrevPage: function(e){
      mediator.Publish('prevpage');
        return this;
    },    

    KeySearch: function(e){
      var keySearchterm = $("#keySearchTask").val();
      mediator.Publish('keySearch', keySearchterm);
        return this;
    },
    pageChanged : function(page){
      this.currentPage = page;

      this.render();
            $('#SelElementsPerPage option:selected').removeAttr('selected');
      var currentSelected = this.elementsPerPage;
      $("#SelElementsPerPage option").filter(function() {
        return $(this).val() == currentSelected; 
      }).attr('selected', true);

      $('#SelElementsPerPage').val(this.elementsPerPage);
    },
    data: function() {
      return {
        currentpage: this.currentPage,
        elementsPerPage: this.elementsPerPage
      };
    },
    initialize: function(){
      this.currentPage = 1;

      this.elementsPerPage = 5;
      console.log('filter view elementsPerPage : '  + this.elementsPerPage);
      mediator.Subscribe('pageChanged', this.pageChanged, {}, this)

    },
    template: 'app/templates/localeedit/filter',
    manage: true
   });

  Views.EditKeyValueItem = Backbone.View.extend({
    template: 'app/templates/localeedit/editKeyValueItem',
    manage: true,

    tagName: "li",
    className: 'edititem ',

    events: {
      "change input.translation":  "translationChanged"
    },
    
    translationChanged: function(ev) {
      this.model.Value = $(ev.target).val();
      this.render();
      mediator.Publish('modelChanged', this.model);      
    },    


    data: function() {
      return { model: this.model };
    }

   });


  Views.EditItem = Backbone.View.extend({
    template: 'app/templates/localeedit/editItem',
    manage: true,

    tagName: "div",
    className: 'edit-wrapper-outer',

    data: function() {
      return { model: this.model,
              index: this.model.index };
    },


    beforeRender: function() {
      var items = this.model.get('LocaleValues');

      for (var i = 0; i < items.length; i++) {
        this.insertView("ul.locales", new Views.EditKeyValueItem({
          model: items[i]
        }));
      }

    }

   });

Views.EditList = Backbone.View.extend({
    template: 'app/templates/localeedit/edit',
    //tagName: 'div',
    manage: true,
       className: 'container',

    data: function() {
      return {
        count: this.collection.length,
        currentpage: this.currentPage
      };
    },

    events: {
      "click #SaveBtn" : "save",
      "click #ResetBtn" : "reload"
      //,
      //"change #taskSorting":"sorts"
    },
    keySearch: function(term){
      var collToUse = this.wholeCollecxtion || this.collection;
      this.renderList(collToUse.search(term));
    },  
    save: function() {          
        //localStorage.setItem(this.name, JSON.stringify(this.data)); 
        LocaleEdit.SaveLocales(this.collection);
    },
    renderList : function(filteredCollection){

     if(this.wholeCollecxtion === undefined)
     {
        this.wholeCollecxtion =  this.collection;
     };
     this.collection = filteredCollection;
     this.render();
    },    

    beforeRender: function() {

      var count = 0;
      var start = (this.currentPage * this.pageSize) - this.pageSize;
      var index = 0;
        console.log('rendering with page size :' + this.pageSize);
      this.collection.each(function(locale) {
        index +=1; 

        if(index > start && count < this.pageSize ) {
          count +=1;
          locale.index = index;
          this.insertView("div.localelistitems", new Views.EditItem({
            model: locale
          }));
        }
      }, this);
    },

    cleanup: function() {
      //this.collection.off(null, null, this);
    },
    reload: function(){
      this.collection.reset();
      this.collection.fetch();
      this.goToPage(1);
    },
    goToPage: function(page) {
      this.currentPage = page;
      mediator.Publish('pageChanged', this.currentPage);
      this.render();
    },
    prevPage: function(){
      if(this.currentPage == 0 ) {
        return;
      };
      this.goToPage(this.currentPage -= 1);
    },    
    nextPage: function(){
      if( (this.currentPage + 1) > (Math.round(this.collection.length / this.pageSize) +1)  )
      {
        return;
      }
      this.goToPage(this.currentPage += 1);
    },
    goToStart: function(){
      this.goToPage(1);   
    },
    goToEnd: function(){
      this.goToPage(Math.round(this.collection.length / this.pageSize) +1 );
    },
    changeElementsPerPage:function(pageSize){
      console.log('setting  page size to:' + Number(pageSize));
      this.pageSize = Number(pageSize);
      this.render();
    },
    syncFilteredWithWholeCollection: function(model){
        console.log(model);
    },
    initialize: function() {
      this.collection.on("reset", this.render, this);
      
      mediator.Subscribe('keySearch', this.keySearch, {}, this);
      mediator.Subscribe('nextpage', this.nextPage, {}, this);      
      mediator.Subscribe('prevpage', this.prevPage, {}, this) ;     

      mediator.Subscribe('goToStart', this.goToStart, {}, this);      
      mediator.Subscribe('goToEnd', this.goToEnd, {}, this)     ;       
      mediator.Subscribe('elementsPerPageCHanged', this.changeElementsPerPage, {}, this);
      mediator.Subscribe('modelChanged', this.syncFilteredWithWholeCollection, {}, this);
      

      this.pageSize = 5;
      this.currentPage = 1;
    }    

  });  

   return Views;

});


