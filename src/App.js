import './App.css';
import React, { useState ,useEffect} from "react";
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import DataTable from "react-data-table-component";
import { CSVLink } from "react-csv";
import axios from 'axios';
import CanvasJSReact from '@canvasjs/react-charts';
const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const addSymbols = (e) => {
  const suffixes = ["","K","M","B"];
  let order = Math.max(Math.floor(Math.log(Math.abs(e.value)) / Math.log(1000)), 0);
  if (order > suffixes.length - 1)
    order = suffixes.length - 1;
  const suffix = suffixes[order];
  return CanvasJS.formatNumber(e.value / Math.pow(1000, order)) + suffix;
}
function App() {
  const [fromDate, setFromDate] = useState(null); // from date sate
  const [toDate, setToDate] = useState(null); // to date state
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [branchLocations, setBranchLocations] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBranches, setSelectedBranches] = useState("");
  const [csvData, setCsvData] = useState([]); // csv file export state
  const [invoice, setInvoice] = useState([]); // invoice generated state
  const [lastbranchdata, setLastbranchdata] = useState([]); // invoice generated state
  const [currentPage, setCurrentPage] = useState(1); // pagination state
  const [rowsPerPage, setRowsPerPage] = useState(10); // row control state
  const [selectedRows, setSelectedRows] = useState([]); // row select state

  useEffect(() => {
    fetchCountries();
  }, []);

  //----------------------------------------------------------------Countries Data Fetching----------------------------------------------------------------

  const fetchCountries = async () => {
    try {
      // Simulating a response from your API
      const response = [{
        id: 1,
        label: 'India',
        value: '1'
      }];

      setCountries(response); // Set the response directly to state
      console.log(response);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };


 //----------------------------------------------------------------States data Fetching----------------------------------------------------------------
 const fetchStates = async (countryId) => {
   console.log(countryId);
   try {
     const response = await fetch(
       `http://164.52.220.10:4040/api/branches/states?branch_country_id=${countryId}`
     );
     const data = await response.json();
     console.log("state",data);
     setStates(data);
   } catch (error) {
     console.error("Error fetching states:", error);
   }
 };

//---------------------------------------------------------------Cites data Fetching--------------------------------------------------------------------

const fetchCities = async (stateId) => {
  console.log(stateId);
  try {
    const response = await fetch(
      `http://164.52.220.10:4040/api/branches/cities?branch_state_id=${stateId}`
    );
    const data = await response.json();
    setCities(data);
    console.log("city",data);
  } catch (error) {
    console.error("Error fetching cities:", error);
  }
};

//---------------------------------------------------------------Location data Fetching--------------------------------------------------------------------

const fetchBranchLocations = async (cityId) => {
  console.log(cityId);

  try {
    const response = await fetch(
      `http://164.52.220.10:4040/api/branches/location?branch_city_id=${cityId}`
    );
    const data = await response.json();
    setBranchLocations(data);
    console.log("branch",data);
  } catch (error) {
    console.error("Error fetching branch locations:", error);
  }
};

  
const handleCountryChange = (e) => {
  const countryId = e.target.value;
  setSelectedCountry(countryId);
  fetchStates(countryId);
  setSelectedState("");
  console.log(countryId);
  setCities([]);
};

//--------------------------------------------------------------- Get State Id --------------------------------------------------------------------------------
const handleStateChange = (e) => {
  const stateId = e.target.value;
  setSelectedState(stateId);
  fetchCities(stateId);
  console.log(stateId);
};
  //--------------------------------------------------------------- Get City Id --------------------------------------------------------------------------------
  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setSelectedCity(cityId);
    fetchBranchLocations(cityId);
    console.log(cityId);
  };

  //--------------------------------------------------------------- Get Location Id --------------------------------------------------------------------------------
  const handleLocationChange = (e) => {
    const branchId = e.target.value;
    setSelectedBranches(branchId);
    console.log(branchId);
  };


    //from date setstate

  const handleFromDate = (date) => {
    setFromDate(date);
  };

    //to date setstate

  const handleToDate = (date) => {
    setToDate(date);
  }

  const fetchBranchData = async () => {
    try {
      const apiUrl = `http://localhost:3001/branchfetch?state=${selectedState}&city=${selectedCity}&branch_name=${selectedBranches}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      setLastbranchdata(data[0]);
      console.log("selectedState:", selectedState);
      console.log("selectedCity:", selectedCity);
      console.log("selectedBranch:", selectedBranches);
      console.log("Branch Data:", data[0]);
      console.log("Lastbranchdata:", lastbranchdata);
    } catch (error) {
      console.error("Error fetching branch data: ", error);
    }
  };
  
  const handleFilterClick = async () => {
    try {
      const today = new Date();
      const fromDateValue = fromDate.toISOString().split('T')[0];
      const toDateValue = toDate.toISOString().split('T')[0];
  
      const apiUrl2 = `http://localhost:3001/api/totalAmount?start=${fromDateValue}&end=${toDateValue}&branch_id=${lastbranchdata.id}`;
  
      const response = await fetch(apiUrl2);
      const data2 = await response.json();
      setInvoice(data2);
      console.log("Invoice", data2);
  
      const csvDataToExport = data2.map((item) => ({
        "Branch": item.branch_id,
        "Patient ID": item.patient_id,
        "Amount": item.total_amount,
      }));
      setCsvData(csvDataToExport);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };
  
  
  // Call handleFilterClick whenever lastbranchdata changes
  useEffect(() => {
    if (lastbranchdata.id && lastbranchdata.id.length > 0) {
      handleFilterClick();
    }
  }, [lastbranchdata]);
  
  
       
  //table data

  const columns = [
    {
      name: 'Branch',
      selector: 'branch_id',
      sortable: true,
    },
    {
      name: 'Patient ID',
      selector: 'patient_id',
      sortable: true,
    },
    {
      name: 'Amount',
      selector: 'total_amount',
      sortable: true,
    },
  ];

  // export button handling

  const handleExportSelected = () => {
    const selectedDataToExport = selectedRows.map((row) => ({
      "Sno": row.id,
      "Branch": row.branch_id,
      "Patient ID": row.patient_id,
      "Amount": row.total_amount,
    }));
  
    selectedDataToExport.sort((a, b) => a.Sno - b.Sno);
  
    return (
      <CSVLink
        data={selectedDataToExport}
        filename={"table_value.csv"}
        className="group [transform:translateZ(0)] px-6 py-3 rounded-lg overflow-hidden bg-gray-300 relative before:absolute before:bg-[#ed4880] before:top-1/2 before:left-1/2 before:h-2 before:w-9 before:-translate-y-1/2 before:-translate-x-1/2 before:rounded-sm  before:opacity-0 hover:before:scale-[6] hover:before:opacity-100 before:transition before:ease-in-out before:duration-500"
      >
        <span className="relative z-0 text-black transition duration-500 ease-in-out group-hover:text-gray-200">
          Export Selected as CSV
        </span>
      </CSVLink>
    );
  };

      // ----------------- PIE-CHART  --------------------------//

  const [labelData, setLabelData] = useState([]);

  useEffect(() => {
    // Fetch data from the API
    fetch("https://650bca9a47af3fd22f668048.mockapi.io/revenue")
      .then((response) => response.json())
      .then((data) => {
        // Extract label names from the fetched data
        const labelNames = data.map((item) => item.branch_name);
        setLabelData(labelNames);

        // Create chart options with the fetched label names
        const options = {
          animationEnabled: true,
          exportEnabled: true,
          theme: "light",
          title: {
            text: "Facility Wise Pie-Chart"
          },
          data: [{
            type: "pie",
            indexLabel: "{label}: {y}%",
            startAngle: -90,
            dataPoints: labelNames.map((label, index) => ({
              y: 20, // You can set the y-values as needed
              label: label,
            })),
          }]
        };

        const chart = new CanvasJS.Chart("chartContainer", options);
        chart.render();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);
  const chartContainerStyle = {
    position: "relative",
    width: "100%",
    height: "400px"
  };
  // -------------------------- chart2----------------------------//
  const [revenueData, setRevenueData] = useState([]);
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  const [optionsA, setOptionsA] = useState({  // Define optionsA state
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Invoices Created Based on the Categories",
    },
    axisX: {
      title: "Categories",
      reversed: true,
    },
    axisY: {
      title: "Amount",
      includeZero: true,
      labelFormatter: addSymbols,
    },
    data: [
      {
        type: "bar",
        dataPoints: [],
      },
    ],
  });

  useEffect(() => {
    fetchData("https://650bca9a47af3fd22f668048.mockapi.io/revenue", setRevenueData);
  }, []);

  function fetchData(url, setData) {
    // You should implement your data fetching logic here
    // It appears that fetchData is not provided in your code, so make sure to define it
    // and use it to fetch the data and update `revenueData` using `setData`.
  }

  function groupAndSumData(data, serviceType) {
    const groupedData = {};

    data.forEach((item) => {
      if (!serviceType || item.service_type === serviceType) {
        const label = item.service_type;
        if (!groupedData[label]) {
          groupedData[label] = 0;
        }
        groupedData[label] += item.amount;
      }
    });

    return Object.keys(groupedData).map((label) => ({
      label,
      y: groupedData[label],
    }));
  }

  // Update optionsA when revenueData changes
  useEffect(() => {
    const chartData = selectedServiceType
      ? groupAndSumData(revenueData, selectedServiceType)
      : groupAndSumData(revenueData);

    setOptionsA((prevOptionsA) => ({
      ...prevOptionsA,
      data: [
        {
          type: "bar",
          dataPoints: chartData,
          click: (e) => {
            const dataPoint = e.dataPoint;
            handleDataPointClick(dataPoint.label);
          },
        },
      ],
    }));
  }, [revenueData, selectedServiceType]);

  const handleDataPointClick = (serviceType) => {
    setSelectedServiceType(serviceType);
  };


  // -------------------- chart 1 --------------------//
  const [chart, setChart] = useState(null);

  const toggleDataSeries = (e) => {
    if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    chart.render();
  };

  const options = {
    theme: "light2",
    animationEnabled: true,
    exportEnabled: true,
    title: {
      text: "Overall Categories",
    },
    axisY: {
      title: "Amount",
    },
    axisX: {
      title: "Year",
    },
    toolTip: {
      shared: true,
    },
    legend: {
      verticalAlign: "center",
      verticalAlign: "bottom",
      reversed: true,
      cursor: "pointer",
      itemclick: toggleDataSeries,
    },
    data: [
    
      {
        type: "stackedArea",
        name: "Invoice Remaining",
        showInLegend: true,
        xValueFormatString: "YYYY-MM-DD",
        dataPoints: revenueData.map(item => ({
          x: new Date(item.invoice_date), // Assuming invoice_date is a valid date
          y: item.amount
        })),
      },
      {
        type: "stackedArea",
        name: "Receipt Genetated",
        showInLegend: true,
        xValueFormatString: "YYYY-MM-DD",
        dataPoints: revenueData.map(item => ({
          x: new Date(item.invoice_date), // Assuming invoice_date is a valid date
          y: item.amount
        })),
      },
      {
        type: "stackedArea",
        name: "Invoice Generated",
        showInLegend: true,
        xValueFormatString: "YYYY-MM-DD",
        dataPoints: revenueData.map(item => ({
          x: new Date(item.invoice_date), // Assuming invoice_date is a valid date
          y: item.amount
        })),
      },
      {
        type: "stackedArea",
        name: "Revenue Geneted",
        showInLegend: true,
        xValueFormatString: "YYYY-MM-DD",
        dataPoints: revenueData.map(item => ({
          x: new Date(item.invoice_date), // Assuming invoice_date is a valid date
          y: item.amount
        })),
      },
    ],
  };


  return (
    <div className="App bg-[#F3F4F6] ">
      <div class="mx-auto container-fluid  border-solid border-1 border-white-500">
        <div className=' px-0 bg-[#F3F4F6] border-solid border-1 border-white-500 md:px-16'>
          <div className='bg-cyan-900'>
            {/* header */}
    <nav class="relative top-0 left-0 w-full z-10 bg-white lg:flex-row lg:flex-nowrap lg:justify-start flex items-center py-1 px-4 lg:bg-transparent">
<div class="w-full mx-aut0 items-center flex justify-between lg:flex-nowrap flex-wrap lg:px-6 px-4">
<img
          class="w-5/12 bg-white rounded-md xl:w-1/12 2xl:h-5/6 desktop:w-1/12 md:w-2/12 lg:w-2/12 mt-[5px] ml-[10px] shadow-md"
          src="https://www.athulyahomecare.com/lp/ophthalmology/Assest/logo.png"
          alt="logo"
        />
<div class="items-center w-full lg:flex lg:w-auto flex-grow duration-300 transition-all ease-in-out lg:h-auto-important hidden">
<h1 class="text-white text-center text-2xl flex-grow mr-[5px] md:mr-[150px]">Athulya Assisted Living Reports</h1>
<form class="flex flex-row flex-wrap items-center ml-auto mr-3 mt-3">
<div class="mb-3 pt-0"><input placeholder="Search here" type="text" class="border-transparent shadow px-3 py-2 text-sm  w-full placeholder-blueGray-200 text-blueGray-700 relative bg-white rounded-md outline-none focus:ring focus:ring-lightBlue-500 focus:ring-1 focus:border-lightBlue-500 border border-solid transition duration-200 "/></div>
</form>
<div class="items-center flex"><span class="w-12 h-12 text-sm text-white bg-blueGray-300 inline-flex items-center justify-center rounded-full"><img alt="..." class="w-full rounded-full align-middle border-none shadow-lg" src="https://demos.creative-tim.com/notus-pro-react/static/media/team-1-800x800.fa5a7ac2.jpg"/></span></div>

</div>
</div>
</nav>
{/* close header */}
</div>
          <main class="  pt-10 bg-[#F3F4F6] border-0 border-white-500">
     <div className="grid lg:grid-cols-3 xl:grid-cols-5 gap-5 border-solid border-1 border-white-500 px-4 md:px-6 mx-auto w-full">

     <div className="">
      {/* country*/}
      <select
  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
  id="country"
  value={selectedCountry}
  onChange={handleCountryChange}
>
  <option value="">Select Country</option>
  {countries.map((country) => (
    <option
      value={country.value} // Use the 'value' field from your response
      key={country.id}       // Use the 'id' field from your response as the key
    >
      {country.label}       {/* Display the 'label' field from your response */}
    </option>
  ))}
</select>
        </div>
     <div className="">
      {/* STATE */}
          <select
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  id="state"
                  value={selectedState}
                  onChange={handleStateChange}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option
                      value={state.branch_state_id}
                      key={state.branch_state_id}
                    >
                      {state.branch_state}
                    </option>
                  ))}
                </select>
        </div>
     <div className="">
      {/* CITY*/}
          <select
                  value={selectedCity}
                  onChange={handleCityChange}
                  id="city"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option
                      value={city.branch_city_id}
                      key={city.branch_city_id}
                    >
                      {city.branch_city}
                    </option>
                  ))}
                </select>
        </div>
     <div className="">
      {/* branch */}
             <select
                  value={selectedBranches}
                  onChange={handleLocationChange}
                  id="branchLocation"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select Branch Location</option>
                  {branchLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.branch_name}
                    </option>
                  ))}
                </select>
        </div>
        <div className=" ">
          {/* from date*/}
          <DatePicker
            selected={fromDate}
            onChange={handleFromDate}
            className="border border-gray-300 h-9 rounded-md px-2 outline-none w-full"
            placeholderText="From Date"
          />
        </div>
        <div className="">
          {/* to date */}
          <DatePicker
            selected={toDate}
            onChange={handleToDate}
            className="border border-gray-300 h-9 rounded-md px-2 outline-none w-full"
            placeholderText="To Date"
          />
        </div>
        <div className="rounded bg-white h-10 shadow-sm border-solid border-1 border-white-500">
          {/* filter button*/}
          <button
            onClick={handleFilterClick} // Call the filter function when the button is clicked
            className="hover:bg-blue-700 text-white font-semibold hover:text-white h-full w-full bg-blue-500 border border-blue-500 hover:border-transparent rounded"
          >
            Filter
          </button>
        </div>
              </div>
              <div class="relative pt-16 pb-16 bg-lightBlue-500">
          <div class="px-4 md:px-6 mx-auto w-full">
             <div>
                <div class="flex flex-wrap">
                   <div class="w-full lg:w-6/12 xl:w-3/12 px-4">
                      <div class="relative flex flex-col min-w-0 break-words bg-white rounded-lg mb-6 xl:mb-0 shadow-lg">
                         <div class="flex-auto p-4">
                            <div class="flex flex-wrap">
                               <div class="relative w-full pr-4 max-w-full flex-grow flex-1">
                               <h5 class="text-blueGray-400 uppercase font-bold text-xs">Revenue Generated</h5>
                               
                               {/* <span class="block text-2xl font-bold">  {new Intl.NumberFormat('en-IN', {
                                       style: 'currency',
                                       currency: 'INR',
                                     }).format(invoice.reduce((total, item) => total + item.total_amount, 0))}</span> */}
                               </div>
                               <div class="relative w-auto pl-4 flex-initial">
                                  <div class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-red-500"><svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg></div>
                               </div>
                            </div>
                            <p class="text-sm text-blueGray-500 mt-4"><span class="text-emerald-500 mr-2"><i class="fas fa-arrow-up"></i> 3.48%</span><span class="whitespace-nowrap">Since last month</span></p>
                         </div>
                      </div>
                   </div>
                   <div class="w-full lg:w-6/12 xl:w-3/12 px-4">
                      <div class="relative flex flex-col min-w-0 break-words bg-white rounded-lg mb-6 xl:mb-0 shadow-lg">
                         <div class="flex-auto p-4">
                            <div class="flex flex-wrap">
                               <div class="relative w-full pr-4 max-w-full flex-grow flex-1">
                                  <h5 class="text-blueGray-400 uppercase font-bold text-xs">Invoice Generated</h5>

                                  {invoice.length > 0 && (
                                  <span class="block text-2xl font-bold">
                                    {new Intl.NumberFormat('en-IN', {
                                      style: 'currency',
                                      currency: 'INR',
                                    }).format(invoice[0].total_amount)}
                                  </span>
                                )}
                               </div>
                               <div class="relative w-auto pl-4 flex-initial">
                                  <div class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-orange-500"> <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg></div>
                               </div>
                            </div>
                            <p class="text-sm text-blueGray-500 mt-4"><span class="text-red-500 mr-2"><i class="fas fa-arrow-down"></i> 3.48%</span><span class="whitespace-nowrap">Since last week</span></p>
                         </div>
                      </div>
                   </div>
                   <div class="w-full lg:w-6/12 xl:w-3/12 px-4">
                      <div class="relative flex flex-col min-w-0 break-words bg-white rounded-lg mb-6 xl:mb-0 shadow-lg">
                         <div class="flex-auto p-4">
                            <div class="flex flex-wrap">
                               <div class="relative w-full pr-4 max-w-full flex-grow flex-1">
                                  <h5 class="text-blueGray-400 uppercase font-bold text-xs">Receipt Generated</h5>
                                  {/* <span class="block text-2xl font-bold">  {new Intl.NumberFormat('en-IN', {
                                       style: 'currency',
                                       currency: 'INR',
                                     }).format(revenueData.reduce((total, item) => total + item.amount, 0))}</span> */}
                               </div>
                               <div class="relative w-auto pl-4 flex-initial">
                                  <div class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-pink-500"><svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg></div>
                               </div>
                            </div>
                            <p class="text-sm text-blueGray-500 mt-4"><span class="text-orange-500 mr-2"><i class="fas fa-arrow-down"></i> 1.10%</span><span class="whitespace-nowrap">Since yesterday</span></p>
                         </div>
                      </div>
                   </div>
                   <div class="w-full lg:w-6/12 xl:w-3/12 px-4">
                      <div class="relative flex flex-col min-w-0 break-words bg-white rounded-lg mb-6 xl:mb-0 shadow-lg">
                         <div class="flex-auto p-4">
                            <div class="flex flex-wrap">
                               <div class="relative w-full pr-4 max-w-full flex-grow flex-1">
                                  <h5 class="text-blueGray-400 uppercase font-bold text-xs">Invoice  Remaining</h5>
                                  {/* <span class="block text-2xl font-bold">  {new Intl.NumberFormat('en-IN', {
                                      style: 'currency',
                                      currency: 'INR',
                                    }).format(invoiceremainData.reduce((total, item) => total + item.amount, 0))}</span> */}
                               </div>
                               <div class="relative w-auto pl-4 flex-initial">
                                  <div class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-blue-500"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none">
                                <g clip-path="url(#clip0_15_784)">
                                <rect width="24" height="24" />
                                <path d="M13.8284 13.8284L20.8995 20.8995M20.8995 20.8995L20.7816 15.1248M20.8995 20.8995L15.1248 20.7816" stroke="currentColor"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M9.89948 13.8284L2.82841 20.8995M2.82841 20.8995L8.60312 20.7816M2.82841 20.8995L2.94626 15.1248" stroke="currentColor"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M13.8284 9.8995L20.8995 2.82843M20.8995 2.82843L15.1248 2.94629M20.8995 2.82843L20.7816 8.60314" stroke="currentColor"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M9.89947 9.89951L2.8284 2.82844M2.8284 2.82844L2.94626 8.60315M2.8284 2.82844L8.60311 2.94629" stroke="currentColor"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </g>
                                <defs>
                                <clipPath id="clip0_15_784">
                                <rect width="24" height="24" />
                                </clipPath>
                                </defs>
                                </svg></div>
                               </div>
                            </div>
                            <p class="text-sm text-blueGray-500 mt-4"><span class="text-emerald-500 mr-2"><i class="fas fa-arrow-up"></i> 12%</span><span class="whitespace-nowrap">Since last month</span></p>
                         </div>
                      </div>
                   </div>
                   <div class="w-full lg:w-6/12 xl:w-3/12 px-4 py-6">
                      <div class="relative flex flex-col min-w-0 break-words bg-white rounded-lg mb-6 xl:mb-0 shadow-lg">
                         <div class="flex-auto p-4">
                            <div class="flex flex-wrap">
                               <div class="relative w-full pr-4 max-w-full flex-grow flex-1">
                                  <h5 class="text-blueGray-400 uppercase font-bold text-xs">Payment Remaining</h5>
                                  {/* <span class="block text-2xl font-bold">  {new Intl.NumberFormat('en-IN', {
                                      style: 'currency',
                                      currency: 'INR',
                                    }).format(invoiceremainData.reduce((total, item) => total + item.amount, 0))}</span> */}
                               </div>
                               <div class="relative w-auto pl-4 flex-initial">
                                  <div class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-green-500"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none">
                            <rect width="24" height="24" />
                            <path d="M2.5 12C2.5 12.2761 2.72386 12.5 3 12.5C3.27614 12.5 3.5 12.2761 3.5 12H2.5ZM3.5 12C3.5 7.30558 7.30558 3.5 12 3.5V2.5C6.75329 2.5 2.5 6.75329 2.5 12H3.5ZM12 3.5C15.3367 3.5 18.2252 5.4225 19.6167 8.22252L20.5122 7.77748C18.9583 4.65062 15.7308 2.5 12 2.5V3.5Z" stroke="currentColor"  stroke-width="2"/>
                            <path d="M20.4716 2.42157V8.07843H14.8147" stroke="currentColor"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M21.5 12C21.5 11.7239 21.2761 11.5 21 11.5C20.7239 11.5 20.5 11.7239 20.5 12L21.5 12ZM20.5 12C20.5 16.6944 16.6944 20.5 12 20.5L12 21.5C17.2467 21.5 21.5 17.2467 21.5 12L20.5 12ZM12 20.5C8.66333 20.5 5.77477 18.5775 4.38328 15.7775L3.48776 16.2225C5.04168 19.3494 8.26923 21.5 12 21.5L12 20.5Z" stroke="currentColor"  stroke-width="2"/>
                            <path d="M3.52844 21.5784L3.52844 15.9216L9.18529 15.9216" stroke="currentColor"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg></div>
                               </div>
                            </div>
                            <p class="text-sm text-blueGray-500 mt-4"><span class="text-emerald-500 mr-2"><i class="fas fa-arrow-up"></i> 12%</span><span class="whitespace-nowrap">Since last month</span></p>
                         </div>
                      </div>
                   </div>
                   <div class="w-full lg:w-6/12  xl:w-3/12 px-4 py-6">
                      <div class="relative flex flex-col min-w-0 break-words bg-white rounded-lg mb-6 xl:mb-0 shadow-lg">
                         <div class="flex-auto p-4">
                            <div class="flex flex-wrap">
                               <div class="relative w-full pr-4 max-w-full flex-grow flex-1">
                                  <h5 class="text-blueGray-400 uppercase font-bold text-xs">Projected Remaining</h5>
                                  {/* <span class="block text-2xl font-bold">  {new Intl.NumberFormat('en-IN', {
                                      style: 'currency',
                                      currency: 'INR',
                                    }).format(invoiceremainData.reduce((total, item) => total + item.amount, 0))}</span> */}
                               </div>
                               <div class="relative w-auto pl-4 flex-initial">
                                  <div class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-sky-500"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none">
                                  <g clip-path="url(#clip0_15_434)">
                                  <rect width="24" height="24" />
                                  <path d="M5 1V5M5 5H1M5 5V18C5 18.5523 5.44772 19 6 19H16" stroke="currentColor"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                  <path d="M19 23L19 19M19 19L23 19M19 19L19 6C19 5.44772 18.5523 5 18 5L8 5" stroke="currentColor"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                  </g>
                                  <defs>
                                  <clipPath id="clip0_15_434">
                                  <rect width="24" height="24" />
                                  </clipPath>
                                  </defs>
                                  </svg></div>
                               </div>
                            </div>
                            <p class="text-sm text-blueGray-500 mt-4"><span class="text-emerald-500 mr-2"><i class="fas fa-arrow-up"></i> 12%</span><span class="whitespace-nowrap">Since last month</span></p>
                         </div>
                      </div>
                   </div>
          
                </div>
             </div>
          </div>
       </div>
       <div style={chartContainerStyle}>
      <div id="chartContainer">
      </div>
    </div>
              <div className="grid col-1 bg-white  shadow-sm border-solid border-1 border-white-500 mt-10">
                <div class="rounded relative overflow-x-auto shadow-md sm:rounded-lg bg-white   border-solid border-2">      
                <CanvasJSChart
        options={options}
        onRef={(ref) => setChart(ref)}
      />
  
                </div>
              </div>
               <br></br>
               
               <div className="grid col-1 bg-white  shadow-sm border-solid border-1 border-white-500">
                
                
                <div class="rounded relative overflow-x-auto shadow-md sm:rounded-lg bg-white   border-solid border-2">
                    
                <CanvasJSChart options={optionsA} />

        
                </div>

            
              </div>
               <br></br>
       <div className="mt-4">
        {/* export button place */}
   {selectedRows.length > 0 && handleExportSelected()}
      </div>
        <div className="grid col-1 bg-white shadow-sm border-solid border-1 border-white-500 mt-4 mb-20">
          
          <div className="rounded relative overflow-x-auto shadow-md sm:rounded-lg bg-white border-solid border-2">
          <DataTable
                  columns={columns}
                  data={invoice.slice(1)}
                  pagination
                  paginationPerPage={rowsPerPage}
                  paginationRowsPerPageOptions={[5, 10, 15, 20]}
                  paginationTotalRows={invoice.length}
                  paginationComponentOptions={{
                    rowsPerPageText: "Rows per page:",
                    rangeSeparatorText: "of",
                    noRowsPerPage: false,
                    selectAllRowsItem: true,
                    selectAllRowsItemText: "All",
                  }}
                  selectableRows
                  onSelectedRowsChange={(selectedRows) => {
                    setSelectedRows(selectedRows.selectedRows);
                  }}
                  onTableUpdate={({ page, rowsPerPage }) => {
                    setCurrentPage(page);
                    setRowsPerPage(rowsPerPage);
                  }}
                />
          </div>
        </div>
          </main>
        </div>
      </div>

    </div>
  );
}

export default App;
