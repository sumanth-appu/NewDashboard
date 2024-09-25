var app = angular.module('myApp', []);

app.controller('MainCtrl', function ($scope, $http) {
  // Default number of errors to display (minimum 5)
  $scope.numErrorsToShow = 5;

  // Cards data remains unchanged
  $scope.cards = [
    // ... other cards
    {
      title: "Progress Report",
      icon: "assessment",
      color: "red lighten-3",
      link: "#",
      progress: 70,
    },
    {
      title: "Reports",
      icon: "insert_drive_file",
      color: "purple lighten-3",
      link: "#",
      progress: 80,
    },
    {
      title: "Admin Ops",
      icon: "person",
      color: "deep-purple lighten-3",
      link: "#",
      progress: 60,
    },
    {
      title: "Indexing QC",
      icon: "check_box",
      color: "cyan lighten-3",
      link: "#",
      progress: 50,
    },
    {
      title: "Installation QC",
      icon: "electric_meter",
      color: "blue lighten-3",
      link: "#",
      progress: 90,
    },
    {
      title: "Maintenance QC",
      icon: "settings",
      color: "teal lighten-3",
      link: "#",
      progress: 85,
    },
    {
      title: "Inventory",
      icon: "storage",
      color: "light-blue lighten-3",
      link: "#",
      progress: 75,
    },
    {
      title: "API Status",
      icon: "cloud_done",
      color: "green lighten-3",
      progress:80,
      link: "#modal1",
      modalTrigger: true
    }
  ];

  // Function to load errors dynamically into the modal
  $scope.loadErrors = function () {
    $http.get('./error_log.txt').then(function(response) {
      var logContent = response.data;

      // Regular expressions to categorize errors
      const authErrorRegex = /PostAuthentication failed with error/g;
      const httpErrorRegex = /502 Bad Gateway|404 Not Found|504 Gateway Timeout/g;
      const apiErrorRegex = /Could not resolve host/g;

      // Arrays to store categorized errors
      const authErrors = [];
      const httpErrors = [];
      const apiErrors = [];

      // Split log file by lines and categorize each line
      const logLines = logContent.split('\n');
      logLines.forEach(line => {
        if (authErrorRegex.test(line)) {
          authErrors.push(line);
        } else if (httpErrorRegex.test(line)) {
          httpErrors.push(line);
        } else if (apiErrorRegex.test(line)) {
          apiErrors.push(line);
        }
      });

      // Display the latest errors in each category
      displayErrors('auth-error-list', getLatestErrors(authErrors));
      displayErrors('http-error-list', getLatestErrors(httpErrors));
      displayErrors('api-error-list', getLatestErrors(apiErrors));

      // Helper function to sort and get the latest errors
      function getLatestErrors(errors) {
        const numErrors = Math.max($scope.numErrorsToShow, 5); // Ensure a minimum of 5 errors
        return errors
          .map(error => ({
            timestamp: extractTimestamp(error),
            error
          }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, numErrors)
          .map(e => e.error); // Get the error message after sorting
      }

      // Helper function to extract the timestamp from an error message
      function extractTimestamp(error) {
        const timestampRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/; // Extract timestamps in ISO format
        const match = error.match(timestampRegex);
        return match ? match[0] : null;
      }

      function displayErrors(listId, errors) {
        const errorList = document.getElementById(listId);
        errorList.innerHTML = ''; // Clear any existing content
      
        if (errors.length === 0) {
          // If no errors, display a message
          const li = document.createElement('li');
          li.textContent = "No errors found.";
          errorList.appendChild(li);
        } else {
          // Display all errors
          errors.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            errorList.appendChild(li);
          });
      
          // If fewer errors than requested, show a message at the end
          if (errors.length < $scope.numErrorsToShow) {
            const li = document.createElement('li');
            li.textContent = `Displayed all available errors. Only ${errors.length} error(s) found.`;
            errorList.appendChild(li);
          }
        }
      }
    });
  };

  // Watch for changes in numErrorsToShow and reload the errors
  $scope.$watch('numErrorsToShow', function(newVal, oldVal) {
    if (newVal !== oldVal && newVal >= 5) {
      $scope.loadErrors(); // Reload the errors when the number of errors to show changes
    }
  });


});

