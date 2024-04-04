const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const customersFilePath = path.join(__dirname, 'customers.json');

app.use(bodyParser.json());
app.use(cors());

let customersData = [];

fs.readFile(customersFilePath, 'utf8', (err, data) => {
  if (err) {
    if (err.code === 'ENOENT') {
      fs.writeFile(customersFilePath, '[]', (err) => {
        if (err) {
          console.error('Error creating customers file:', err);
          return;
        }
        console.log('Customers file created successfully.');
      });
    } else {
      console.error('Error reading customers file:', err);
      return;
    }
  } else {
    customersData = JSON.parse(data);
  }
});

app.get('/api/getcustomers', (req, res) => {
  res.json(customersData);
});

app.post('/api/createcustomers', (req, res) => {
  const newCustomer = req.body;
  customersData.push(newCustomer);
  fs.writeFile(customersFilePath, JSON.stringify(customersData, null, 2), (err) => {
    if (err) {
      console.error('Error writing customers file:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.status(201).json(newCustomer);
  });
});

app.put('/api/updatecustomers/:id', (req, res) => {
  const customerId = req.params.id;
  const updatedCustomerData = req.body;
  
  const index = customersData.findIndex(customer => customer.id === customerId);

  if (index !== -1) {
   
    customersData[index] = { ...customersData[index], ...updatedCustomerData };

    
    fs.writeFile(customersFilePath, JSON.stringify(customersData, null, 2), (err) => {
      if (err) {
        console.error('Error writing customers file:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.status(200).json(customersData[index]);
    });
  } else {
    res.status(404).json({ customerId: customerId, error: 'Customer not found' });
  }
});

app.delete('/api/deletecustomers/:id', (req, res) => {
  const customerId = req.params.id; 
  const index = customersData.findIndex(customer => customer.id === customerId);
  if (index !== -1) {
    customersData.splice(index, 1);
    fs.writeFile(customersFilePath, JSON.stringify(customersData, null, 2), (err) => {
      if (err) {
        console.error('Error writing customers file:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.sendStatus(204);
    });
  } else {
    res.status(404).json({customerId: customerId ,  error: 'Customer not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
