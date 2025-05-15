import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  trainId: string = '';
  trainType: string = 'intercity';
  trainRoute: string = '';
  trainData: any[] = [];
  stationConnections: { [station: string]: string[] } = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Fetch the trainData.json file on component initialization
    this.http
      .get<any[]>('./assets/trainData.json') // Adjust the path if necessary
      .subscribe(
        (data) => {
          this.trainData = data;
          console.log('Train data loaded:', this.trainData);
          this.processStations(); // Process the data after loading
        },
        (error) => {
          console.error('Error loading train data:', error);
        }
      );
  }

  processStations() {
    // Object to store unique stations and their connections
    const stationConnections: {
      [station: string]: {
        type: string;
        connections: { station: string; duration: number }[];
      };
    } = {};

    // Loop through each train's data
    this.trainData.forEach((train) => {
      const stations: string[] = train.stations;
      const trainType = train.type; // Get the type of the train (sprinter or intercity)

      // Loop through the stations in the current train's route
      stations.forEach((station, index) => {
        // Ensure the station exists in the connections object
        if (!stationConnections[station]) {
          stationConnections[station] = {
            type: trainType, // Initialize with the current train type
            connections: [],
          };
        } else {
          // If the station already exists, update the type to "intercity" if either train is intercity
          if (
            stationConnections[station].type !== 'intercity' &&
            trainType === 'intercity'
          ) {
            stationConnections[station].type = 'intercity';
          }
        }

        // Add the previous station (if it exists)
        if (index > 0) {
          const previousStation = stations[index - 1];
          if (
            !stationConnections[station].connections.some(
              (connection) => connection.station === previousStation
            )
          ) {
            stationConnections[station].connections.push({
              station: previousStation,
              duration: 0,
            });
          }
        }

        // Add the next station (if it exists)
        if (index < stations.length - 1) {
          const nextStation = stations[index + 1];
          if (
            !stationConnections[station].connections.some(
              (connection) => connection.station === nextStation
            )
          ) {
            stationConnections[station].connections.push({
              station: nextStation,
              duration: 0,
            });
          }
        }
      });
    });
    // Save the result to local storage
    localStorage.setItem(
      'stationConnections',
      JSON.stringify(stationConnections)
    );
    console.log(
      'Station Connections saved to local storage:',
      stationConnections
    );
  }

  onSubmit() {
    // Split the route into an array of stations
    const stations = this.trainRoute
      .split(/\s*[-–]\s*/)
      .map((station) => station.trim());
    console.log(stations);
    // Create the new train data object
    const newTrainData = {
      id: this.trainId,
      type: this.trainType,
      stations: stations,
    };

    // Retrieve existing data from local storage
    const existingData = localStorage.getItem('trainData');
    let trainDataArray = existingData ? JSON.parse(existingData) : [];

    // Ensure the data is an array
    if (!Array.isArray(trainDataArray)) {
      trainDataArray = [];
    }

    // Add the new data to the array
    trainDataArray.push(newTrainData);

    // Save the updated array back to local storage
    localStorage.setItem('trainData', JSON.stringify(trainDataArray));

    console.log('Updated data saved to local storage:', trainDataArray);

    // Reset the input fields
    this.trainId = '';
    this.trainType = 'sprinter';
    this.trainRoute = '';
  }
}
