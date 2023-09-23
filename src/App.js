import './App.css';
import React, { useState, useEffect } from "react";
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './Pagination.css';
import CanvasJSReact from '@canvasjs/react-charts';
import * as XLSX from "xlsx";
const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSChart = CanvasJSReact.CanvasJSChart;
const itemsPerPage = 7;

const addSymbols = (e) => {
  const suffixes = ["","K"];
  let order = Math.max(Math.floor(Math.log(Math.abs(e.value)) / Math.log(1000)), 0);
  if (order > suffixes.length - 1)
    order = suffixes.length - 1;
  const suffix = suffixes[order];
  return CanvasJS.formatNumber(e.value / Math.pow(1000, order)) + suffix;
}

function App() {

  const [currentPage, setCurrentPage] = useState(0);
  const [revenueData, setRevenueData] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const [invoiceremainData, setInvoiceremainData] = useState([]);
  const [activeDataSource, setActiveDataSource] = useState(null);
  const [tabledata2,settabledata2]=useState([]);
  const [selecttype,setselecttype]=useState('Invoices');
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  useEffect(() => {
    if (activeDataSource === "revenue") {
      fetchData("https://650bca9a47af3fd22f668048.mockapi.io/revenue", setRevenueData);
    } 
    else if (activeDataSource === "invoice") {
      fetchData("https://650bca9a47af3fd22f668048.mockapi.io/user", setInvoiceData);
    }
    else if (activeDataSource === "invoice_pending") {
      fetchData("https://650c3bfb47af3fd22f67525b.mockapi.io/invoicepending", setInvoiceremainData);
    }
  }, [activeDataSource]);

  const fetchData = (apiUrl, setData) => {
    axios.get(apiUrl)
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
      });
  };

  const handleDataSourceChange = (dataSource) => {
    setActiveDataSource(dataSource);
    setCurrentPage(0); // Reset page to 0 when changing data source
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const displayedData = activeDataSource === "revenue" ? revenueData : activeDataSource === "invoice" ? invoiceData : invoiceremainData;
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = displayedData.slice(startIndex, endIndex);
  const paginatedData2 = tabledata2.slice(startIndex, endIndex);
 
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
      horizontalAlign: "right",
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
        dataPoints: invoiceremainData.map(item => ({
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
        dataPoints: invoiceData.map(item => ({
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
  const [optionsA, setOptionsA] = useState({
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Invoices Created Based on the Categories",
    },
    axisX: {
      title: "categories",
      reversed: true,
    },
    axisY: {
      title: "Amount",
      includeZero: true,
      labelFormatter: addSymbols,
    },
    data: [{
      type: "bar",
      dataPoints: groupAndSumData(revenueData),
    }],
  });
  
  // Update optionsA when revenueData changes
  useEffect(() => {
    setOptionsA((prevOptionsA) => ({
      ...prevOptionsA,
      data: [{
        type: "bar",
        dataPoints: groupAndSumData(revenueData, selectedServiceType),
        click: (e) => {
          const dataPoint = e.dataPoint;
          handleDataPointClick(dataPoint.label);
        }
      }],
    }));
  }, [revenueData, selectedServiceType]);
 

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };
  const handleDataPointClick = (serviceType) => {
    setSelectedServiceType(serviceType);
  };
  return (
    <div className="App container mx-auto">
       
      <div class="mx-auto container-fluid  border-solid border-1 border-white-500">
        <div className='  bg-[#F3F4F6] border-solid border-1 border-white-500'>
        <header class="col-span-7 h-16 bg-[#F3F4F6] border-solid border-1 border-white-500">
      <div class="flex items-center justify-center">
      <img
          class="w-5/12 bg-white rounded-md xl:w-1/12 2xl:h-5/6 desktop:w-1/12 md:w-2/12 lg:w-2/12 mt-[5px] ml-[10px] shadow-md"
          src="https://www.athulyahomecare.com/lp/ophthalmology/Assest/logo.png"
          alt="logo"
        />
        <h1 class="text-center text-2xl flex-grow mr-[5px] md:mr-[150px]">Athulya Assisted Living</h1>
      </div>
    </header>
          <main class="  p-10 bg-[#F3F4F6] border-0 border-white-500">

              <div className="grid lg:grid-cols-3 gap-5 mb-16 border-solid border-1 border-white-500">
              <button onClick={() => handleDataSourceChange("revenue")}>
                <div className="rounded bg-white shadow-sm border-solid border-1 border-white-500">
                  <div class="flex items-center p-5 bg-white shadow rounded-lg">
                    <div class="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-purple-600 bg-purple-100 rounded-full mr-6">
                      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                    <span class="block text-2xl font-bold">  {new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(revenueData.reduce((total, item) => total + item.amount, 0))}</span>
                      <span class="block text-gray-500"> Revenve Generated</span>
                    </div>
                  </div>
                </div>
                </button>
                <button onClick={() => handleDataSourceChange("invoice")}>
                <div className="rounded bg-white  shadow-sm border-solid border-1 border-white-500" >

                  <div class="flex items-center p-5 bg-white shadow rounded-lg">
                    <div class="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-blue-600 bg-blue-100 rounded-full mr-6">
                      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                    <span class="block text-2xl font-bold">  {new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(invoiceData.reduce((total, item) => total + item.amount, 0))}</span>
                      <span class="block text-gray-500">Invoice Generated</span>
                    </div>
                  </div>

                </div>
                </button>
                <button onClick={() => handleDataSourceChange("revenue")}>
                <div className="rounded bg-white  shadow-sm border-solid border-1 border-white-500">

                  <div class="flex items-center p-5 bg-white shadow rounded-lg">
                    <div class="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-green-600 bg-green-100 rounded-full mr-6">
                      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                    <span class="block text-2xl font-bold">  {new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(revenueData.reduce((total, item) => total + item.amount, 0))}</span>
                      <span class="block text-gray-500">Receipt Generated</span>
                    </div>
                  </div>

                </div>
                </button>
                <button onClick={() => handleDataSourceChange("invoice_pending")}>
                <div className="rounded bg-white  shadow-sm border-solid border-1 border-white-500">

                  <div class="flex items-center p-5 bg-white shadow rounded-lg">
                    <div class="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-green-600 bg-green-100 rounded-full mr-6">
                      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      
                    </div>
                    <div>
                    <span class="block text-2xl font-bold">  {new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(invoiceremainData.reduce((total, item) => total + item.amount, 0))}</span>
                      <span class="block text-gray-500">Invoice  Remaining</span>
                    </div>
                  </div>

                </div>
                </button>
                <div className="rounded bg-white  shadow-sm border-solid border-1 border-white-500">

                  <div class="flex items-center p-5 bg-white shadow rounded-lg">
                    <div class="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-green-600 bg-green-100 rounded-full mr-6">
                      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <span class="block text-2xl font-bold">40000</span>
                      <span class="block text-gray-500">Payment Remaining</span>
                    </div>
                  </div>

                </div>
                <div className="rounded bg-white  shadow-sm border-solid border-1 border-white-500">

                  <div class="flex items-center p-5 bg-white shadow rounded-lg">
                    <div class="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-green-600 bg-green-100 rounded-full mr-6">
                      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <span class="block text-2xl font-bold">200000</span>
                      <span class="block text-gray-500">Projected Remaining</span>
                    </div>
                  </div>

                </div>
              </div>
              <div className="grid col-1 bg-white h-96 shadow-sm border-solid border-1 border-white-500">
                
                
                <div class="rounded relative overflow-x-auto shadow-md sm:rounded-lg bg-white   border-solid border-2">
                    
                <CanvasJSChart
        options={options}
        onRef={(ref) => setChart(ref)}
      />
  
                </div>


              </div>
               <br></br>
               <div className="grid col-1 bg-white h-96 shadow-sm border-solid border-1 border-white-500">
                
                
                <div class="rounded relative overflow-x-auto shadow-md sm:rounded-lg bg-white   border-solid border-2">
                    
                <CanvasJSChart options={optionsA} />
  
                </div>


              </div>
               <br></br>

            {/* List of Data */}
              <div className="grid col-1 bg-white  shadow-sm border-solid border-1 border-white-500">
              <button
  onClick={() => exportToExcel(paginatedData, "exported_data")}
  className="px-4 py-2 w-36 h-10 bg-green-700 text-white rounded hover:bg-green-900 transition duration-300 ease-in-out shadow-xl"
>
  Export to Excel
</button>
              <div class="rounded relative overflow-x-auto shadow-md sm:rounded-lg bg-white   border-solid border-2">
              { selecttype==='Invoices' ?
                  <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead class="text-xs text-black uppercase bg-white dark:bg-white dark:text-black border-b border-gray-100">
                          <tr>
                              <th scope="col" class="px-6 py-3 font-semibold">
                                  Sno
                              </th>
                              <th scope="col" class="px-6 py-3 font-semibold">
                                  Branch
                              </th>
                              <th scope="col" class="px-6 py-3 font-semibold">
                                  Patient ID
                              </th>
                              <th scope="col" class="px-6 py-3 font-semibold">
                                  Patient Name
                              </th>
                              <th scope="col" class="px-6 py-3 font-semibold">
                                  Invoice No
                              </th>
                              <th scope="col" class="px-6 py-3 font-semibold">
                                  Invoice Date
                              </th>
                              <th scope="col" class="px-6 py-3 font-semibold">
                                  Amount
                              </th>
                              <th scope="col" class="px-6 py-3 font-semibold">
                                  Status
                              </th>
                              <th scope="col" class="px-6 py-3 font-semibold">
                                  service Type
                              </th>

                          </tr>
                      </thead>
                      <tbody>
                          
                      {paginatedData
        .filter((item) => !selectedServiceType || item.service_type === selectedServiceType)
        .map((item, index) => (
                            
                          <React.Fragment key={index}>
                            <tr className='border-b border-gray-100 bg-white'>
                              <td class="px-6 py-4 text-black whitespace-nowrap">{startIndex + index + 1}</td>
                              <td class="px-6 py-4 text-black whitespace-nowrap">{item.branch_name}</td>
                              <td class="px-6 py-4 text-black whitespace-nowrap">{item.patient_id}</td>
                              <td class="px-6 py-4 text-black whitespace-nowrap">{item.patient_name}</td>
                              <td class="px-6 py-4 text-black whitespace-nowrap">{item.invoice_no}</td>
                              <td class="px-6 py-4 text-black whitespace-nowrap">{item.invoice_date}</td>
                              <td class="px-6 py-4 text-black whitespace-nowrap">{item.amount}</td>
                              <td class="px-6 py-4 text-black whitespace-nowrap">{item.status}</td>
                              <td class="px-6 py-4 text-black whitespace-nowrap">{item.service_type}</td>

                            </tr>

                          </React.Fragment>
                        ))}
                      </tbody>
                      
                  </table>
:
<table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
<thead class="text-xs text-black uppercase bg-white dark:bg-white dark:text-black border-b border-gray-100">
    <tr>
        <th scope="col" class="px-6 py-3 font-semibold">
            Sno
        </th>
        <th scope="col" class="px-6 py-3 font-semibold">
            Branch
        </th>
        <th scope="col" class="px-6 py-3 font-semibold">
            Patient ID
        </th>
        <th scope="col" class="px-6 py-3 font-semibold">
            Patient Name
        </th>
        <th scope="col" class="px-6 py-3 font-semibold">
            Invoice No
        </th>
        <th scope="col" class="px-6 py-3 font-semibold">
            Invoice Date
        </th>
        <th scope="col" class="px-6 py-3 font-semibold">
            Amount
        </th>
        <th scope="col" class="px-6 py-3 font-semibold">
            Status
        </th>
        <th scope="col" class="px-6 py-3 font-semibold">
            service Type
        </th>

    </tr>
</thead>
<tbody>
    
{paginatedData2
        .filter((item) => !selectedServiceType || item.service_type === selectedServiceType)
        .map((item, index) => (
      
    <React.Fragment key={index}>
      <tr className='border-b border-gray-100 bg-white'>
        <td class="px-6 py-4 text-black whitespace-nowrap">{startIndex + index + 1}</td>
        <td class="px-6 py-4 text-black whitespace-nowrap">{item.branch_name}</td>
        <td class="px-6 py-4 text-black whitespace-nowrap">{item.patient_id}</td>
        <td class="px-6 py-4 text-black whitespace-nowrap">{item.patient_name}</td>
        <td class="px-6 py-4 text-black whitespace-nowrap">{item.invoice_no}</td>
        <td class="px-6 py-4 text-black whitespace-nowrap">{item.invoice_date}</td>
        <td class="px-6 py-4 text-black whitespace-nowrap">{item.amount}</td>
        <td class="px-6 py-4 text-black whitespace-nowrap">{item.status}</td>
        <td class="px-6 py-4 text-black whitespace-nowrap">{item.service_type}</td>

      </tr>

    </React.Fragment>
  ))}
</tbody>

</table>
}
<ReactPaginate
        previousLabel={"Previous"}
        nextLabel={"Next"}
        pageCount={Math.ceil(
          (selecttype === 'Invoices' ? displayedData.length : tabledata2.length) / itemsPerPage
        )}
        onPageChange={handlePageChange}
        containerClassName={"pagination"}
        activeClassName={"active"}
      />
              </div>


              </div>
          </main>
          <footer class="col-span-7 p-10  border-2 border-sky-500">
            <h1 class="text-center text-2xl">Footer</h1>
          </footer>
        </div>
      </div>

    </div>
  );
}

export default App;
