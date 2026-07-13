import React, { Component } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  LinearProgress,
  DialogTitle,
  DialogContent,
  TableBody,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell
} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import swal from 'sweetalert';
import { withRouter } from './utils';
const axios = require('axios');

class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      token: '',
      openProductModal: false,
      openProductEditModal: false,
      id: '',
      name: '',
      desc: '',
      price: '',
      discount: '',
      file: null,
      fileName: '',
      page: 1,
      search: '',
      products: [],
      pages: 0,
      loading: false
    };
  }

  componentDidMount = () => {
    let token = localStorage.getItem('token');
    if (!token || token === 'null') {
      this.props.navigate('/login');
    } else {
      this.setState({ token: token }, () => {
        this.getProduct();
      });
    }
  };

  getProduct = () => {
    this.setState({ loading: true });

    let data = `?page=${this.state.page}`;
    if (this.state.search) {
      data = `${data}&search=${this.state.search}`;
    }

    axios
      .get(`http://https://mern-crud-app-neuv.onrender.com/get-product${data}`, {
        headers: {
          token: this.state.token
        }
      })
      .then((res) => {
        this.setState({
          loading: false,
          products: res.data.products || [],
          pages: res.data.pages || 0
        });
      })
      .catch((err) => {
        swal({
          text: err?.response?.data?.errorMessage || 'Something went wrong',
          icon: 'error'
        });
        this.setState({
          loading: false,
          products: [],
          pages: 0
        });
      });
  };

  deleteProduct = (id) => {
    axios
      .post(
        'http://https://mern-crud-app-neuv.onrender.com/delete-product',
        { id: id },
        {
          headers: {
            'Content-Type': 'application/json',
            token: this.state.token
          }
        }
      )
      .then((res) => {
        swal({
          text: res.data.title,
          icon: 'success'
        });

        this.setState({ page: 1 }, () => {
          this.getProduct();
        });
      })
      .catch((err) => {
        swal({
          text: err?.response?.data?.errorMessage || 'Something went wrong',
          icon: 'error'
        });
      });
  };

  pageChange = (e, page) => {
    this.setState({ page: page }, () => {
      this.getProduct();
    });
  };

  logOut = () => {
    localStorage.removeItem('token');
    this.props.navigate('/');
  };

  onChange = (e) => {
    // FILE INPUT
    if (e.target.files && e.target.files[0]) {
      this.setState({
        file: e.target.files[0],
        fileName: e.target.files[0].name
      });
      return;
    }

    // NORMAL INPUTS
    const name = e.target.name;
    const value = e.target.value;

    if (!name) return;

    this.setState({ [name]: value }, () => {
      if (name === 'search') {
        this.setState({ page: 1 }, () => {
          this.getProduct();
        });
      }
    });
  };

  addProduct = () => {
    const formData = new FormData();
    formData.append('file', this.state.file);
    formData.append('name', this.state.name);
    formData.append('desc', this.state.desc);
    formData.append('discount', this.state.discount);
    formData.append('price', this.state.price);

    axios
      .post('http://https://mern-crud-app-neuv.onrender.com/add-product', formData, {
        headers: {
          token: this.state.token
        }
      })
      .then((res) => {
        swal({
          text: res.data.title,
          icon: 'success'
        });

        this.handleProductClose();
        this.setState(
          {
            name: '',
            desc: '',
            discount: '',
            price: '',
            file: null,
            fileName: '',
            page: 1
          },
          () => {
            this.getProduct();
          }
        );
      })
      .catch((err) => {
        swal({
          text: err?.response?.data?.errorMessage || 'Something went wrong',
          icon: 'error'
        });
      });
  };

  updateProduct = () => {
    const formData = new FormData();
    formData.append('id', this.state.id);

    // only append file if user selected a new file
    if (this.state.file) {
      formData.append('file', this.state.file);
    }

    formData.append('name', this.state.name);
    formData.append('desc', this.state.desc);
    formData.append('discount', this.state.discount);
    formData.append('price', this.state.price);

    axios
      .post('http://https://mern-crud-app-neuv.onrender.com/update-product', formData, {
        headers: {
          token: this.state.token
        }
      })
      .then((res) => {
        swal({
          text: res.data.title,
          icon: 'success'
        });

        this.handleProductEditClose();
        this.setState(
          {
            id: '',
            name: '',
            desc: '',
            discount: '',
            price: '',
            file: null,
            fileName: ''
          },
          () => {
            this.getProduct();
          }
        );
      })
      .catch((err) => {
        swal({
          text: err?.response?.data?.errorMessage || 'Something went wrong',
          icon: 'error'
        });
      });
  };

  handleProductOpen = () => {
    this.setState({
      openProductModal: true,
      id: '',
      name: '',
      desc: '',
      price: '',
      discount: '',
      file: null,
      fileName: ''
    });
  };

  handleProductClose = () => {
    this.setState({
      openProductModal: false,
      id: '',
      name: '',
      desc: '',
      price: '',
      discount: '',
      file: null,
      fileName: ''
    });
  };

  handleProductEditOpen = (data) => {
    this.setState({
      openProductEditModal: true,
      id: data._id,
      name: data.name,
      desc: data.desc,
      price: data.price,
      discount: data.discount,
      file: null,
      fileName: data.image
    });
  };

  handleProductEditClose = () => {
    this.setState({
      openProductEditModal: false,
      id: '',
      name: '',
      desc: '',
      price: '',
      discount: '',
      file: null,
      fileName: ''
    });
  };

  render() {
    return (
      <div>
        {this.state.loading && <LinearProgress size={40} />}

        <div>
          <h2>Dashboard</h2>

          <Button
            className="button_style"
            variant="contained"
            color="primary"
            size="small"
            onClick={this.handleProductOpen}
          >
            Add Product
          </Button>

          <Button
            className="button_style"
            variant="contained"
            size="small"
            onClick={this.logOut}
            style={{ marginLeft: '10px' }}
          >
            Log Out
          </Button>
        </div>

        {/* EDIT PRODUCT MODAL */}
        <Dialog
          open={this.state.openProductEditModal}
          onClose={this.handleProductEditClose}
          aria-labelledby="edit-product-title"
        >
          <DialogTitle id="edit-product-title">Edit Product</DialogTitle>
          <DialogContent>
            <TextField
              type="text"
              autoComplete="off"
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              placeholder="Product Name"
              fullWidth
              margin="dense"
            />

            <TextField
              type="text"
              autoComplete="off"
              name="desc"
              value={this.state.desc}
              onChange={this.onChange}
              placeholder="Description"
              fullWidth
              margin="dense"
            />

            <TextField
              type="number"
              autoComplete="off"
              name="price"
              value={this.state.price}
              onChange={this.onChange}
              placeholder="Price"
              fullWidth
              margin="dense"
            />

            <TextField
              type="number"
              autoComplete="off"
              name="discount"
              value={this.state.discount}
              onChange={this.onChange}
              placeholder="Discount"
              fullWidth
              margin="dense"
            />

            <br />
            <br />

            <Button variant="contained" component="label">
              Upload
              <input
                type="file"
                accept="image/*"
                name="file"
                onChange={this.onChange}
                hidden
              />
            </Button>

            <span style={{ marginLeft: '10px' }}>{this.state.fileName}</span>
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleProductEditClose} color="primary">
              Cancel
            </Button>

            <Button
              disabled={
                this.state.name === '' ||
                this.state.desc === '' ||
                this.state.discount === '' ||
                this.state.price === ''
              }
              onClick={this.updateProduct}
              color="primary"
              autoFocus
            >
              Edit Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* ADD PRODUCT MODAL */}
        <Dialog
          open={this.state.openProductModal}
          onClose={this.handleProductClose}
          aria-labelledby="add-product-title"
        >
          <DialogTitle id="add-product-title">Add Product</DialogTitle>
          <DialogContent>
            <TextField
              type="text"
              autoComplete="off"
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              placeholder="Product Name"
              fullWidth
              margin="dense"
            />

            <TextField
              type="text"
              autoComplete="off"
              name="desc"
              value={this.state.desc}
              onChange={this.onChange}
              placeholder="Description"
              fullWidth
              margin="dense"
            />

            <TextField
              type="number"
              autoComplete="off"
              name="price"
              value={this.state.price}
              onChange={this.onChange}
              placeholder="Price"
              fullWidth
              margin="dense"
            />

            <TextField
              type="number"
              autoComplete="off"
              name="discount"
              value={this.state.discount}
              onChange={this.onChange}
              placeholder="Discount"
              fullWidth
              margin="dense"
            />

            <br />
            <br />

            <Button variant="contained" component="label">
              Upload
              <input
                type="file"
                accept="image/*"
                name="file"
                onChange={this.onChange}
                hidden
              />
            </Button>

            <span style={{ marginLeft: '10px' }}>{this.state.fileName}</span>
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleProductClose} color="primary">
              Cancel
            </Button>

            <Button
              disabled={
                this.state.name === '' ||
                this.state.desc === '' ||
                this.state.discount === '' ||
                this.state.price === '' ||
                !this.state.file
              }
              onClick={this.addProduct}
              color="primary"
              autoFocus
            >
              Add Product
            </Button>
          </DialogActions>
        </Dialog>

        <br />

        <TableContainer>
          <TextField
            type="search"
            autoComplete="off"
            name="search"
            value={this.state.search}
            onChange={this.onChange}
            placeholder="Search by product name"
          />

          <Table aria-label="product table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Image</TableCell>
                <TableCell align="center">Description</TableCell>
                <TableCell align="center">Price</TableCell>
                <TableCell align="center">Discount</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {this.state.products.map((row) => (
                <TableRow key={row._id}>
                  <TableCell align="center">{row.name}</TableCell>
                  <TableCell align="center">
                    <img
                      src={`http://https://mern-crud-app-neuv.onrender.com/${row.image}`}
                      alt={row.name}
                      width="70"
                      height="70"
                    />
                  </TableCell>
                  <TableCell align="center">{row.desc}</TableCell>
                  <TableCell align="center">{row.price}</TableCell>
                  <TableCell align="center">{row.discount}</TableCell>
                  <TableCell align="center">
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => this.handleProductEditOpen(row)}
                    >
                      Edit
                    </Button>

                    <Button
                      className="button_style"
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => this.deleteProduct(row._id)}
                      style={{ marginLeft: '8px' }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <br />

          <Pagination
            count={this.state.pages}
            page={this.state.page}
            onChange={this.pageChange}
            color="primary"
          />
        </TableContainer>
      </div>
    );
  }
}

export default withRouter(Dashboard);