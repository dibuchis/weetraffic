jQ = jQuery;
var appRoute = document.location.origin + document.location.pathname;
var fnodes = null;
var nPool = 1;
var dgType = 'week';
var dgName = null;

jQ.ajax({
  method: "GET",
  url: appRoute + "/app/System/AppFactory.php",
  data: {
    fn:"userLayout"
  },
  complete: function(rs){
    dgType = rs.responseText;
  }
});

function newDiagram(){
swal({
    title: "Estás seguro?",
    text: "¡Advertencia! si aceptas, se borrará todo el contenido!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
     closeOnClickOutside: false,
  })
  .then((willNew) => {
      if(willNew){
        swal({
          title: "Elige el tipo de Tráfico.",
          closeOnClickOutside: false,
          buttons: {
            cancel: {
              text: "Proyecto",
              value: 'project',
              visible: true,
              className: ""
            },
            confirm: {
              text: "Semanal",
              value: 'week',
              visible: true,
              className: ""
            }
          }
        })
        .then((value) => {
            dgType = value;
            loadNewDiagram();
            reloadLayout();
            swal("Tu nuevo documento ha sido creado!", {
              icon: "success",
            });
        });
      }
  });
}

// Show the diagram's model in JSON format
function saveDiagram(notif = true) {
  swal("Seguro de guardar el tráfico?", {
     closeOnClickOutside: false,
    buttons: {
      cancel: {
        text: "Cancelar",
        value: false,
        visible: true,
        className: ""
      },
      confirm: {
        text: "Guardar",
        value: true,
        visible: true,
        className: ""
      }
    },
  })
  .then((value) => {
    // console.log(value);
    var isName = null;

    if(dgName !== null){
      isName = dgName;
    }
        
    if(value == true){
      jQ.ajax({
        method:"POST",
        url: appRoute + "/app/System/AppFactory.php",
        data: {
          fn:"saveDiagram",
          data: myDiagram.model.toJson(),
          type: dgType,
          name: isName
        },
        complete: function(rs){
          // console.log(rs.responseText);
          var flag = rs.responseText;
          if(flag == 1){
            if(notif){
              swal("Tráfico guardado", {
                icon: "success",
              });
            }
          }else{
            if(notif){
              swal("Error al guardar", {
                icon: "error",
              });
            }else{
              console.log("Error de guardado");
            }
          }
        }
      });
    }
  });
  
}

// function autoSaveDiagram() {
  
//   jQ.ajax({
//     method:"POST",
//     url: appRoute + "/app/System/AppFactory.php",
//     data:{
//       fn:"saveDiagram", 
//             data: myDiagram.model.toJson() 
//             // data: "{}"
//           },
//         complete: function(rs){
//           // console.log(rs.responseText);
//           var flag = rs.responseText;
//           if(flag !== 1){
//               console.log("Error de guardado");
//             }
//           }
//         });
        
// }
      
function addRow(){
  swal("Defina un nombre o categoría de fila", {
     closeOnClickOutside: false,
    content: {
      element: "input",
      attributes: {
        placeholder: "Descripción",
        type: "text",
      },
    },
  })
  .then((value) => {
    addRowTrigger(value, dgType);
  });
  
}

function addRowTrigger(poolName, type = dgType){
  if(myDiagram !== null){
    if(type == 'week'){
      myDiagram.model.addNodeData({"key": "Pool" + nPool, "text": poolName, "isGroup": true, "category": "Pool" });
      myDiagram.model.addNodeData({"key": "Team" + nPool, "text": "Equipo", "group": "Pool" + nPool , "isGroup": true, "loc": "0 23.52284749830794", "isHighlighted": true });
      myDiagram.model.addNodeData({"key": "Lunes" + nPool, "text": "Lunes", "group": "Pool" + nPool , "isGroup": true, "loc": "0 23.52284749830794", "isHighlighted": true });
      myDiagram.model.addNodeData({"key": "Martes" + nPool, "text": "Martes", "group": "Pool" + nPool , "isGroup": true, "loc": "0 23.52284749830794", "isHighlighted": true });
      myDiagram.model.addNodeData({"key": "Miercoles" + nPool, "text": "Miércoles", "group": "Pool" + nPool , "isGroup": true, "loc": "0 23.52284749830794", "isHighlighted": true });
      myDiagram.model.addNodeData({"key": "Jueves" + nPool, "text": "Jueves", "group": "Pool" + nPool , "isGroup": true, "loc": "0 23.52284749830794", "isHighlighted": true });
      myDiagram.model.addNodeData({"key": "Viernes" + nPool, "text": "Viernes", "group": "Pool" + nPool , "isGroup": true, "loc": "0 23.52284749830794", "isHighlighted": true });
      myDiagram.model.addNodeData({"key": 1, "group": "Team" + nPool, "category": "newteam", "loc": "12 35.52284749830794" });
      myDiagram.model.addNodeData({"key": 1, "group": "Lunes" + nPool, "category": "newbutton", "loc": "12 35.52284749830794" });
      myDiagram.model.addNodeData({"key": 1, "group": "Martes" + nPool, "category": "newbutton", "loc": "12 35.52284749830794" });
      myDiagram.model.addNodeData({"key": 1, "group": "Miercoles" + nPool, "category": "newbutton", "loc": "12 35.52284749830794" });
      myDiagram.model.addNodeData({"key": 1, "group": "Jueves" + nPool, "category": "newbutton", "loc": "12 35.52284749830794" });
      myDiagram.model.addNodeData({"key": 1, "group": "Viernes" + nPool, "category": "newbutton", "loc": "12 35.52284749830794" });
      nPool++;
    }

    if(type == 'project'){
      myDiagram.model.addNodeData({"key": "Pool" + nPool, "text": poolName, "isGroup": true, "category": "Pool" });
      myDiagram.model.addNodeData({ "key": "Cliente" + nPool, "text": "Cliente", "group": "Pool" + nPool, "isGroup": true, "loc": "0 23.52284749830794"});
      myDiagram.model.addNodeData({ "key": "Trabajo" + nPool, "text": "Trabajo", "group": "Pool" + nPool, "isGroup": true, "loc": "0 23.52284749830794"});
      myDiagram.model.addNodeData({ "key": "FechaEntrega" + nPool, "text": "Fecha de entrega", "group": "Pool" + nPool, "isGroup": true, "loc": "0 23.52284749830794"});
      myDiagram.model.addNodeData({ "key": "ResponsableCtas" + nPool, "text": "Resp. de Cuentas", "group": "Pool" + nPool, "isGroup": true, "loc": "0 23.52284749830794"});
      myDiagram.model.addNodeData({ "key": "ResponsableCrea" + nPool, "text": "Resp. de Creatividad", "group": "Pool" + nPool, "isGroup": true, "loc": "0 23.52284749830794"});
      myDiagram.model.addNodeData({ "key": "ResponsableEstr" + nPool, "text": "Resp. de Estrategia", "group": "Pool" + nPool, "isGroup": true, "loc": "0 23.52284749830794"});
      myDiagram.model.addNodeData({ "key": "ResponsableProd" + nPool, "text": "Resp. de Producción", "group": "Pool" + nPool, "isGroup": true, "loc": "0 23.52284749830794"});
      myDiagram.model.addNodeData({ "key": 0, "group": "Pool" + nPool, "index": nPool,"category": "newjob", "loc": "12 35.52284749830794" });
      myDiagram.model.addNodeData({ "key": 0, "group": "Cliente" + nPool, "category": "project", "loc": "12 35.52284749830794", "text":"", "column":1});
      myDiagram.model.addNodeData({ "key": 0, "group":"Trabajo" + nPool, "category": "cell",  "loc":"0 23.52284749830794", "text":"", "column":1});
      myDiagram.model.addNodeData({ "key": 0, "group":"FechaEntrega" + nPool, "category": "cell", "width": 120, "loc":"0 23.52284749830794", "text":"", "column":1});
      myDiagram.model.addNodeData({ "key": 0, "group":"ResponsableCtas" + nPool, "category": "cell", "width": 120, "loc":"0 23.52284749830794", "text":"", "column":1});
      myDiagram.model.addNodeData({ "key": 0, "group":"ResponsableCrea" + nPool, "category": "cell", "width": 120, "loc":"0 23.52284749830794", "text":"", "column":1});
      myDiagram.model.addNodeData({ "key": 0, "group":"ResponsableEstr" + nPool, "category": "cell", "width": 120, "loc":"0 23.52284749830794", "text":"", "column":1});
      myDiagram.model.addNodeData({ "key": 0, "group":"ResponsableProd" + nPool, "category": "cell", "width": 120, "loc":"0 23.52284749830794", "text":"", "column":1});
      nPool++;
    }
  }
}

(function($){
  "use strict";
  $(document).ready(function(){

    /*
    *
    * Logout function
    * 
    */
    $("#logout-btn").click(function(e){

      $("#loader-user").removeClass("hidden");

      e.preventDefault();
      e.stopPropagation();
      
      jQ.ajax({
        method:"POST",
        url: appRoute + "/app/System/AppFactory.php",
        data:{
            fn:"logout"
            // data: "{}"
          },
        complete: function(rs){
          console.log(rs.responseText);
          var flag = rs.responseText;
          setTimeout(function(flag){
                $("#loader-user").addClass("hidden");
                var flag = rs.responseText;
                if(flag){
                  window.location.reload();
                }else{
                  swal("Hubo un error, intentelo de nuevo.", {
                    icon: "error"
                  });
                }
          }, 2000);
        }
      });
    });
  });
})(jQuery);

// window.onbeforeunload = function() {
//   return "Es posible que los cambios que implementaste no se puedan guardar?";
// }

function changeLayout(type){
  dgType = type;
  findDiagram();
}