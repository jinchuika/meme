/*
* MemeEditorView
* Manages form capture, model updates, and selection state of the editor form.
*/
MEME.MemeEditorView = Backbone.View.extend({

  initialize: function() {
    this.buildForms();
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },

  // Builds all form options based on model option arrays:
  buildForms: function() {
    var d = this.model.toJSON();

    function buildOptions(opts) {
      return _.reduce(opts, function(memo, opt) {
        return memo += ['<option value="', opt.hasOwnProperty('value') ? opt.value : opt, '">', opt.hasOwnProperty('text') ? opt.text : opt, '</option>'].join('');
      }, '');
    }

    if (d.textShadowEdit) {
      $('#text-shadow').parent().show();
    }

    // Build text alignment options:
    if (d.textAlignOpts && d.textAlignOpts.length) {
      $('#text-align').append(buildOptions(d.textAlignOpts)).show();
    }

    // Build font size options:
    if (d.fontSizeOpts && d.fontSizeOpts.length) {
      $('#font-size').append(buildOptions(d.fontSizeOpts)).show();
    }

    // Build font family options:
    if (d.fontFamilyOpts && d.fontFamilyOpts.length) {
      $('#font-family').append(buildOptions(d.fontFamilyOpts)).show();
    }

    // Build watermark options:
    if (d.watermarkOpts && d.watermarkOpts.length) {
      $('#watermark').append(buildOptions(d.watermarkOpts)).show();
    }

    // Build overlay color options:
    if (d.overlayColorOpts && d.overlayColorOpts.length) {
      var overlayOpts = _.reduce(d.overlayColorOpts, function(memo, opt) {
        var color = opt.hasOwnProperty('value') ? opt.value : opt;
        return memo += '<li><label><input class="m-editor__swatch" style="background-color:'+color+'" type="radio" name="overlay" value="'+color+'"></label></li>';
      }, '');

      $('#overlay').show().find('ul').append(overlayOpts);
    }
    
    // Build aspect ratio options:
    if (d.aspectOpts && d.aspectOpts.length) {
      var aspectOpts = _.reduce(d.aspectOpts, function(memo, opt) {
        var aspect = opt.hasOwnProperty('value') ? opt.value : opt
        ,text = opt.hasOwnProperty('text') ? opt.text : opt;
        return memo += '<label><input type="radio" name="aspect" value="'+aspect+'">'+text+'</label>';
      }, '');

      $('#aspect').show().find('ul').append(aspectOpts);
    }
    
    //hide more options
    this.onMoreOptions();
  },

  render: function() {
    var d = this.model.toJSON();
    this.$('#headline').val(d.headlineText);
    this.$('#credit').val(d.creditText);
    this.$('#watermark').val(d.watermarkSrc);
    this.$('#watermark-size').val(d.watermarkMaxWidthRatio);
    this.$('#image-scale').val(d.imageScale);
    this.$('#font-size').val(d.fontSize);
    this.$('#font-family').val(d.fontFamily);
    this.$('#text-align').val(d.textAlign);
    this.$('#text-shadow').prop('checked', d.textShadow);
    this.$('#height').val(d.height);
    this.$('#width').val(d.width);
    this.$('#overlay').find('[value="'+d.overlayColor+'"]').prop('checked', true);
    //this.$('#aspect').find('[value="'+d.aspect+'"]').prop('checked', true);
  },

  events: {
    'input #headline': 'onHeadline',
    'input #credit': 'onCredit',
    'input #image-scale': 'onScale',
    'input #credit-size': 'onCreditSize',
    'change [name="aspect"]': 'onAspect',
    'input #font-size': 'onFontSize',
    'change #font-family': 'onFontFamily',
    'change #watermark': 'onWatermark',
    'input #watermark-size': 'onWatermarkSize',
    'change #text-align': 'onTextAlign',
    'change #text-shadow': 'onTextShadow',
    'change #overlay-shape': 'onOverlayShape',
    'input #height': 'onHeight',
    'input #width': 'onWidth',
    'change [name="overlay"]': 'onOverlayColor',
    'input #overlay-alpha': 'onOverlayAlpha',
    'dragover #dropzone': 'onZoneOver',
    'dragleave #dropzone': 'onZoneOut',
    'drop #dropzone': 'onZoneDrop',
    'change #uploader': 'onUpload',
    'change #btn-more-options' : 'onMoreOptions'
  },

  onCredit: function() {
    this.model.set('creditText', this.$('#credit').val());
  },
  
  onCreditSize: function() {
    this.model.set('creditSize', this.$('#credit-size').val());
  },

  onHeadline: function() {
    this.model.set('headlineText', this.$('#headline').val());
  },

  onTextAlign: function() {
    this.model.set('textAlign', this.$('#text-align').val());
  },

  onTextShadow: function() {
    this.model.set('textShadow', this.$('#text-shadow').prop('checked'));
  },

  onFontSize: function() {
    this.model.set('fontSize', this.$('#font-size').val());
  },

  onFontFamily: function() {
    this.model.set('fontFamily', this.$('#font-family').val());
  },

  onWatermark: function() {
    this.model.set('watermarkSrc', this.$('#watermark').val());
    if (localStorage) localStorage.setItem('meme_watermark', this.$('#watermark').val());
  },
  
  onWatermarkSize: function() {
    this.model.set('watermarkSrc', this.$('#watermark').val());
    this.model.set('watermarkMaxWidthRatio', this.$('#watermark-size').val());
  },

  onScale: function() {
    this.model.set('imageScale', this.$('#image-scale').val());
  },
  
  onAspect: function(evt) {
    this.model.set('width', this.$(evt.target).val().split('x')[0]);
    this.model.set('height', this.$(evt.target).val().split('x')[1]);
  },
  
  onHeight: function(evt) {
    this.model.set('height', this.$('#height').val());
  },
  
  onWidth: function(evt) {
    this.model.set('width', this.$('#width').val());
  },

  onOverlayColor: function(evt) {
    this.model.set('overlayColor', this.$(evt.target).val());
  },
  
  onOverlayAlpha: function(evt) {
    this.model.set('overlayAlpha', this.$('#overlay-alpha').val());
  },
  
  onOverlayShape: function(evt) {
    this.model.set('overlayShape', this.$('#overlay-shape').prop('checked'));
  },

  getDataTransfer: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    return evt.originalEvent.dataTransfer || null;
  },

  onZoneOver: function(evt) {
    var dataTransfer = this.getDataTransfer(evt);
    if (dataTransfer) {
      dataTransfer.dropEffect = 'copy';
      this.$('#dropzone').addClass('pulse');
    }
  },

  onZoneOut: function(evt) {
    this.$('#dropzone').removeClass('pulse');
  },
  
  onUpload: function(evt) {
    var file = event.target.files[0];
    if(file){
      this.model.loadBackground(file);
    }
  },
  
  onMoreOptions: function (evt) {
    if(this.$('#btn-more-options').prop('checked')===true){
      this.$('#more-options').show();
    }
    else{
      this.$('#more-options').hide();
    }
  },
  
  onZoneDrop: function(evt) {
    var dataTransfer = this.getDataTransfer(evt);
    if (dataTransfer) {
      this.model.loadBackground(dataTransfer.files[0]);
      this.$('#dropzone').removeClass('pulse');
    }
  }/*,
  onUpload: function(evt) {
    var dataTransfer = this.getDataTransfer(evt);
    if (dataTransfer) {
      this.model.loadBackground(event.target.files[0];);
      //this.$('#dropzone').removeClass('pulse');
    }
  }*/
});