import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  trainId: string = '';
  trainType: string = 'intercity';
  trainRoute: string = '';

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
  saveToFile() {
    // Retrieve the data from local storage
    const trainData = localStorage.getItem('trainData');
    if (!trainData) {
      console.error('No data found in local storage to save.');
      return;
    }

    // Create a Blob from the JSON string
    const blob = new Blob([trainData], { type: 'application/json' });

    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'trainData.json'; // File name for the downloaded file
    a.click();

    // Clean up the URL object
    URL.revokeObjectURL(a.href);
  }
}
