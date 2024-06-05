import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const LoginCredentials = [
  {
    email: 'admin@admin.com',
    senha: '123456'
  },
  {
    email: 'daniel@daniel.com',
    senha: '123456'
  }
];

function App() {
  const [sales, setSales] = useState([]);
  const [amount, setAmount] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setIsLoggedIn(true);
      const userEmail = JSON.parse(storedUser).email;
      setEmail(userEmail);
      loadSales(userEmail);
    }
  }, []);

  const loadSales = (userEmail) => {
    const storedSales = localStorage.getItem(`sales_${userEmail}`);
    if (storedSales) {
      setSales(JSON.parse(storedSales));
    }
  };

  const handleAddSale = () => {
    if (amount === '') {
      toast.error('Por favor, insira um valor para a venda.');
      return;
    }
    const newSale = {
      amount: parseFloat(amount),
      date: new Date().toLocaleDateString('pt-BR')
    };
    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    localStorage.setItem(`sales_${email}`, JSON.stringify(updatedSales));
    setAmount('');
  };

  const handleDeleteSale = (index) => {
    const updatedSales = sales.filter((_, i) => i !== index);
    setSales(updatedSales);
    localStorage.setItem(`sales_${email}`, JSON.stringify(updatedSales));
  };

  const handleLogin = () => {
    const user = LoginCredentials.find(
      (user) => user.email === email && user.senha === senha
    );
    if (user) {
      setIsLoggedIn(true);
      localStorage.setItem('user', JSON.stringify(user));
      loadSales(user.email);
    } else {
      alert('Credenciais inválidas');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    setSales([]);
    setEmail('');
    setSenha('');
  };

  const handleReset = () => {
    setSales([]);
    localStorage.removeItem(`sales_${email}`);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const getCurrentMonth = () => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const now = new Date();
    return monthNames[now.getMonth()];
  };

  const getTotalSalesForCurrentMonth = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return sales
      .filter(sale => {
        const saleDate = new Date(sale.date.split('/').reverse().join('-'));
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      })
      .reduce((total, sale) => total + sale.amount, 0);
  };

  const generatePDFDocument = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Vendas", 10, 10);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 10, 20);

    sales.forEach((sale, index) => {
      doc.text(`Venda ${index + 1}: Valor: R$ ${sale.amount.toFixed(2)} - Data: ${sale.date}`, 10, 30 + (index * 10));
    });

    const totalSalesForCurrentMonth = getTotalSalesForCurrentMonth();
    const currentMonthName = getCurrentMonth();
    doc.text(`\nTotal de vendas em ${currentMonthName}: R$ ${totalSalesForCurrentMonth.toFixed(2)}`, 10, 30 + (sales.length * 10) + 10);

    doc.save("Relatório_de_Vendas.pdf");
  };

  const totalSalesForCurrentMonth = getTotalSalesForCurrentMonth();
  const currentMonthName = getCurrentMonth();

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <h1>Login</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="input-field"
        />
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Senha"
          className="input-field"
        />
        <button onClick={handleLogin} className="login-button">Entrar</button>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>Registro de Vendas</h1>
        <button onClick={handleLogout} className="logout-button">Sair</button>
      </header>
      <div className="main-content">
        <div className="add-sale-card">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Valor da venda"
            className="input-field"
          />
          <div className="buttons-container">
            <button onClick={handleAddSale} className="add-button">Adicionar Venda</button>
            <button onClick={generatePDFDocument} className="save-button">Salvar como PDF</button>
          </div>
        </div>
        <div className="sales-list-container">
          <div className="details-reset-container">
            <button onClick={toggleDetails} className="details-button">
              {showDetails ? 'Ocultar Detalhes' : 'Exibir Detalhes'}
            </button>
            <button onClick={handleReset} className="reset-button">Resetar Mês</button>
          </div>
          {showDetails && (
            <ul className="sales-list">
              {sales.map((sale, index) => (
                <li key={index} className="sales-item">
                  Valor: R$ {sale.amount.toFixed(2)} - Data: {sale.date}
                  <FaTrash className="delete-icon" onClick={() => handleDeleteSale(index)} />
                </li>
              ))}
            </ul>
          )}
          <p>Total de vendas em {currentMonthName}: R$ {totalSalesForCurrentMonth.toFixed(2)}</p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
