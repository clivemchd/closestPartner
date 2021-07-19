const partners = [{
	'uid' : '123',
  'content_wrapper' : {
    'disaster_recovery' : {
			"data_centers_list": {
				"locations": [
					{
						"city": "Tel Aviv-Yafo",
						"state": "Tel Aviv",
						"country": "Israel",
						"region": "APAC",
						"latitude": 32.08,
						"longitude": 34.77,
						"vmware_datacenter": true,
						"_metadata": {
							"uid": "cs66638742fbfcebe3"
						}
					},
					{
						"city": "Baz",
						"country": "Albania",
						"vmware_datacenter": true,
						"latitude": 41.6319,
						"longitude": 19.9292,
						"region": "EMEA",
						"state": "Diber",
						"_metadata": {
							"uid": "cs99310bcffc9b662b"
						}
					}
				]
			}
    }
  }
}, {
	'uid' : '456',
	'content_wrapper' : {
    'disaster_recovery' : {
			"data_centers_list": {
				"locations": [
					{
						"city": "Istanbul",
						"state": "Istanbul",
						"country": "Turkey",
						"region": "EMEA",
						"latitude": "41.105",
						"longitude": "29.01",
						"vmware_datacenter": true,
						"_metadata": {
							"uid": "csbcef11aba6fc3551"
						}
					},
					{
						"city": "Izmir",
						"state": "Izmir",
						"country": "Turkey",
						"region": "EMEA",
						"latitude": "38.4361",
						"longitude": "27.1518",
						"vmware_datacenter": false,
						"_metadata": {
							"uid": "cs93dd7938ddce2290"
						}
					}
				]
			}
    }
  }
}, {
	'uid' : '789',
	'content_wrapper' : {
    'disaster_recovery' : {
			"data_centers_list": {
				"locations": [
					{
						"vmware_datacenter": true,
						"_metadata": {
							"uid": "cs4928d40a35a5e05b"
						},
						"region": "EMEA",
						"city": "Malmo",
						"state": "Skane",
						"country": "Sweden",
						"latitude": "55.5833",
						"longitude": "13.0333"
					},
					{
						"vmware_datacenter": true,
						"_metadata": {
							"uid": "csa4995d5c11b1f122"
						},
						"region": "EMEA",
						"city": "Umea",
						"state": "Vasterbotten",
						"country": "Sweden",
						"latitude": "63.83",
						"longitude": "20.24"
					}
				]
			}
    }
  }
}]

const visitorLocation = {
	latitude: 38.8935755,
	longitude: -77.084615
}

let closestPartners = [ ...partners ];
let maxDistanceRange = 999999;
let dataCenterLocationText = '';
let modifiedPartner = {};

/**
   * Checks if object is defined at every level in the path provided
   * @param {object} obj - The object to check
   * @param {string} path  - The path inside the object to check. eg: "partner_configuration.oauth_service.url"
 */
 const isDefined = (obj, path) => {
	let pathArr = path.split('.');
	let newObj = { ...obj };
	return pathArr.every((elem, index) => {
		newObj = newObj[pathArr[index]];
		return newObj;
	});
}

const deg2rad = (deg) => {
	return deg * (Math.PI/180)
}

const GetDistanceFromLatLonInKm = (visitor, partner) => { //visitor
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(partner.latitude - visitor.latitude);  // deg2rad below
	var dLon = deg2rad(partner.longitude - visitor.longitude); 
	var a = 
		Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(deg2rad(visitor.latitude)) * Math.cos(deg2rad(partner.latitude)) * 
		Math.sin(dLon/2) * Math.sin(dLon/2)
		; 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c; // Distance in km
	return d;
}

const setClosestLocation = (singlePartner) => {
	singlePartner.content_wrapper.disaster_recovery.data_centers_list.locations.forEach((partnerLocation) => {
		const distance = GetDistanceFromLatLonInKm(visitorLocation, partnerLocation);
		if(distance < maxDistanceRange){
			maxDistanceRange = distance;
			dataCenterLocationText = `${partnerLocation.city}, ${partnerLocation.state}, ${partnerLocation.country}`;
		}
	})
	modifiedPartner = { ...singlePartner, closestDataCenterName: dataCenterLocationText, distanceFromVisitor: maxDistanceRange };
}

partners && partners.length > 0 && partners.forEach((singlePartner, index) => {
	if(isDefined(singlePartner, 'content_wrapper.disaster_recovery.data_centers_list.locations')){
		setClosestLocation(singlePartner);
		closestPartners.splice(index, 1, modifiedPartner)
		maxDistanceRange = 999999;
		dataCenterLocationText = '';
		modifiedPartner = {};
	}
});

closestPartners.sort((firstElem, secondElem) => {
	if(firstElem.distanceFromVisitor > secondElem.distanceFromVisitor)
		return 1;
	if(firstElem.distanceFromVisitor < secondElem.distanceFromVisitor)
		return -1;
	return 0
})

console.log(closestPartners);