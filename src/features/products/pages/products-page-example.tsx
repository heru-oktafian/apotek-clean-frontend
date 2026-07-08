import React, { useState, useEffect } from 'react';
import { ListTablePage, Column, formatCurrency } from '../../../components/ListTablePage';
import apiClient from '../../../lib/api/client';

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  price: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://apidev.vimedika.com';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const pageSize = 12;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`${API_BASE}/api/products`, {
        params: { page: currentPage, limit: pageSize }
      });
      setProducts(response.data.data || response.data);
      setTotalData(response.data.total || response.data.length || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const handleAdd = () => {
    console.log('Add new product');
    // Navigate to add product form
  };

  const handleEdit = (row: Product) => {
    console.log('Edit product:', row);
    // Navigate to edit product form
  };

  const handleDelete = async (row: Product) => {
    if (confirm(`Hapus produk "${row.name}"?`)) {
      try {
        await apiClient.delete(`${API_BASE}/api/products/${row.id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleExportExcel = () => {
    console.log('Export Excel');
    // Trigger Excel export
  };

  const handleExportPDF = () => {
    console.log('Export PDF');
    // Trigger PDF export
  };

  const handleRefresh = () => {
    fetchProducts();
  };

  // Column definitions
  const columns: Column<Product>[] = [
    { key: 'id', header: 'ID Produk', width: '100px' },
    { key: 'code', header: 'Kode', width: '80px' },
    { key: 'name', header: 'Nama', width: 'auto' },
    { key: 'category', header: 'Kategori', width: '120px' },
    { 
      key: 'stock', 
      header: 'Stok', 
      width: '80px',
      align: 'right',
      render: (value) => value
    },
    { 
      key: 'price', 
      header: 'Harga', 
      width: '120px',
      align: 'right',
      render: (value) => formatCurrency(value as number)
    },
  ];

  return (
    <ListTablePage
      breadcrumbs={['Dashboard', 'Master', 'Produk']}
      subtitle="Kelola Data Produk"
      columns={columns}
      data={products}
      loading={loading}
      pageSize={pageSize}
      currentPage={currentPage}
      totalData={totalData}
      onPageChange={setCurrentPage}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onExportExcel={handleExportExcel}
      onExportPDF={handleExportPDF}
      onRefresh={handleRefresh}
      emptyMessage="Tidak ada data produk"
    />
  );
}
