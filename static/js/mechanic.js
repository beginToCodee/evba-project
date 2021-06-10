

let data;
let myModal; 
let resp_time = 20;
let time_interval;
let lat = 26.820629631172608;
let lon = 87.2906443710893;
var map = null;
let source_lat = 26.81343506065695;
let source_lng = 87.29458612690827;
let dest_lat = 26.81222888210907; 
let dest_lng = 87.28523289839184;
let routingControl = null;




const showModel = ()=>{
	myModal =  new bootstrap.Modal(document.getElementById('myModal'), {
				  keyboard: false
					});
    document.getElementById('main_body').innerHTML = display_message();
    let time = 100;
    time_interval = setInterval(()=>{
        document.getElementById('time_show').innerText = time-1;
        time--;
        if(time===0){
            myModal.hide();
            // send_reponse(false);
            clearInterval(time_interval);
        }
    },1000);

    
    myModal.show();
    setTimeout(function(){ show_map(); showRouting(); }, 2000);
	
}





const url = `ws://${window.location.host}/ws/mechanic/notifications/`;


const ws = new WebSocket(url);
ws.onopen = event=>{
    console.log("connecting ........");
}

ws.onmessage = event=>{
    console.log("messaging .....");
    data= JSON.parse(event.data);
    console.log(data)
    source_lat = data.m_lat;
    source_lng = data.m_lon;
    dest_lat = data.d_lat;
    dest_lng = data.d_lon;

    showModel();

}
ws.onerror = event=>{
    console.log("error occur");
}
ws.onclose = event=>{
    console.log("closing the application");
}

const display_message = ()=>{

    const div = `
                    <div class="row">
                        <div class="col-4">
                            <h5>Name : ${data.driver_name}</h5>
                            <h5>Service : ${data.service}</h5>
                            <img src="${data.vehicle_image}" class="img-fluid">
                            <hr>
                            <div>Problem Description : 
                                ${data.problem_desc}
                            </div>
                        </div>
                        <div class="col-8">
                            <p >Remaining Time: <span id="time_show">${resp_time}</span> seconds </p>
                            <hr>
                            <div id="map" style="height:600px;">
                            </div>
                        </div>

                </div>
            `;
    return div;
}


const send_reponse = (status)=>{
    clearInterval(time_interval);
    myModal.hide();
    if(status){

        const driver_detail = document.getElementById('driver_detail');
        driver_detail.innerHTML = `
                            <h5>Name : ${data.driver_name}</h5>
                            <h5>Service : ${data.service}</h5>
                            <img src="${data.vehicle_image}" class="img-fluid">
                            <hr>
                            <div>Problem Description : 
                                ${data.problem_desc}
                            </div>
                        `;

     if(map){ 

        map == null;
        
        document.getElementById("map_container").innerHTML = `<button type="button" onClick="enlarge()" id="map_ctrl_btn">view</button>`;
        document.getElementById("map_container").innerHTML += `<div id="mymap" style="height:500px;">`;
        setTimeout(()=>{
            map = L.map('mymap').setView([source_lat, source_lng],13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
            showRouting();
    },2000);
    
    }
    
   }

    const d = {
        'accept':status,
        'driver_id':data.driver_id,
        'help_id':data.help_id,
        'distance':data.distance,
        'm_lat':data.m_lat,
        'm_lng':data.m_lon
    
    }
    console.log(d);
    const params = {
        method:"post",
        headers:{
            'Content-Type':'application/json',
        },
        body: JSON.stringify(d)
    }
    const resp_url = `http://${window.location.host}/tracker/mechanic/send_response/`;
   
    fetch(resp_url,params).then(resp=>resp.json()).then(json_data=>{
        console.log(json_data)
    });
    
}
const show_map = ()=>{
    if(map){
        map == null;
    }
    map = L.map('map').setView([source_lat, source_lng],13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
    showRouting();

    showMarkerAddress();
}

const showRouting = ()=>{
    console.log(dest_lat,dest_lng);
          if (routingControl != null) {
            map.removeControl(routingControl);
            routingControl = null;
        }
          routingControl = L.Routing.control({
          waypoints: [
              L.latLng(source_lat,source_lng),
              L.latLng(dest_lat,dest_lng),
              
             
            
            
          ],
          routeWhileDragging: false,
          urlParameters: {
        vehicle: 'car'
    }

        }).addTo(map);
        showMarkerAddress();
        
        routingControl.getRouter().options.urlParameters.vehicle = 'foot';
        routingControl.route();
      }
    const showMarkerAddress = ()=>{
      const dest_marker = L.marker([source_lat,source_lng]).addTo(map);
      const source_marker = L.marker([dest_lat,dest_lng]).addTo(map);
      setAddress('Destination',source_marker,dest_lat,dest_lng);
      setAddress('Source',dest_marker,source_lat,source_lng);
      
      

    }
    const setAddress = (source_or_dest,marker,lat,lng)=>{
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      fetch(url).then(resp=>resp.json()).then(json_resp=>{
  
        let full_address = '';
        // console.log(json)
        if(json_resp.address.amenity){
          full_address += json_resp.address.amenity+' ';
        }
        if(json_resp.address.road){
          full_address +=json_resp.address.road;
        }
        full_address +=json_resp.address.city;
        marker.bindPopup(`<span>${source_or_dest}</span><br><span>${full_address}</span>`,{closeOnClick: false, autoClose: false}).openPopup();

        
      })

    }





const resize_map = ()=>{
        let map_div = document.getElementById('map_container');
        map_div.style.transform = "scale(1)";
        map_div.style.transition = "transform 0.25s ease";
        let map_ctrl_btn = document.getElementById("map_ctrl_btn");
        map_div.style.width ="";
        map_div.style['translate'] = "0 0";

        map_ctrl_btn.setAttribute("onClick","enlarge()");
        map_ctrl_btn.innerHTML = "view full";
    }

    const enlarge = ()=>{
        console.log("hello world");
        // Set image size to 1.5 times original
        let map_div = document.getElementById('map_container');
       
        map_div.style.height = "500px";
        map_div.style.width = "900px";
        // map_div.innerHTML = `<button type="button">Resize</button>`
        let map_ctrl_btn = document.getElementById("map_ctrl_btn");
        map_ctrl_btn.innerHTML ="resize";
        map_ctrl_btn.setAttribute("onClick","resize_map()");
        map_div.style['translate'] = "100px -650px";
        map_div.style.transform = "scale(1.5)";

        // Animation effect 
        map_div.style.transition = "transform 0.25s ease";

}