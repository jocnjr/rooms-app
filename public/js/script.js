window.onload = () => {
    const ironhackSP = {
      lat: -23.56173216, 
      lng: -46.6623271
    };
    
    const map = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: ironhackSP
    });
  
    const bounds = new google.maps.LatLngBounds();
  
    const getRooms = () => {
      axios.get("/api/rooms")
      .then( response => {
        placeRooms(response.data.rooms);
      })
      .catch(error => {
        console.log(error);
      })
    };
    
    const getRoom = () => {
      console.log(`${idRoom}`);
      axios.get(`/api/room/${idRoom}`)
      .then( response => {
        placeRoom(response.data.room);
      })
      .catch(error => {
        console.log(error);
      })
    };
  
    const placeRooms = (rooms) => {
      rooms.forEach((room) => {
        const roomLocation = {
          lat: room.location.coordinates[1],
          lng: room.location.coordinates[0]
        };
    
  
        bounds.extend(roomLocation);
        
        new google.maps.Marker({
          position: roomLocation,
          map: map,
          title: room.name
        });
  
      });
      map.fitBounds(bounds);
    }
    
    const placeRoom = (room) => {
        const roomLocation = {
          lat: room.location.coordinates[1],
          lng: room.location.coordinates[0]
        };
        bounds.extend(roomLocation);
        new google.maps.Marker({
          position: roomLocation,
          map: map,
          title: room.name
        });
  
        map.fitBounds(bounds);
    }
  
    (idRoom !== 'null') ? getRoom() : getRooms();
  
  };
  
  
  