import {
    collection,
    doc,
    getDocs,
    setDoc,
    serverTimestamp,
    Timestamp,
    deleteDoc,
    query,
    limit,
  } from "firebase/firestore"
  import { db } from "./config"
  import type { Product, Customer, Sale, Invoice } from "@/types/firestore"
  
  // Sample placeholder base64 image (very small transparent pixel)
  const placeholderBase64 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
  
  // Sample products data
  const sampleProducts: Product[] = [
    {
      name: "Premium Oil Filter",
      sku: "OIL-FLT-001",
      category: "Filters",
      description: "High-quality oil filter for optimal engine protection",
      price: 12.99,
      purchasePrice: 7.5,
      stock: 45,
      reorderLevel: 10,
      imageBase64: placeholderBase64,
      supplier: "AutoParts Inc.",
      supplierContact: "supplier@autoparts.com",
      vehicleCompatibility: "Most domestic and import vehicles",
    },
    {
      name: "Brake Pads (Front)",
      sku: "BRK-PAD-001",
      category: "Brakes",
      description: "Ceramic brake pads for quiet, smooth braking",
      price: 49.99,
      purchasePrice: 32.5,
      stock: 32,
      reorderLevel: 15,
      imageBase64: placeholderBase64,
      supplier: "BrakeMasters Co.",
      supplierContact: "orders@brakemasters.com",
      vehicleCompatibility: "Toyota, Honda, Ford, Chevrolet (2010-2023)",
    },
    {
      name: "Windshield Wipers",
      sku: "WIP-BLD-001",
      category: "Exterior",
      description: "All-weather windshield wiper blades",
      price: 24.99,
      purchasePrice: 14.25,
      stock: 8,
      reorderLevel: 20,
      imageBase64: placeholderBase64,
      supplier: "VisibilityPlus",
      supplierContact: "sales@visibilityplus.com",
      vehicleCompatibility: "Universal fit for most vehicles",
    },
    {
      name: "Air Filter",
      sku: "AIR-FLT-001",
      category: "Filters",
      description: "Engine air filter for improved performance",
      price: 15.99,
      purchasePrice: 8.75,
      stock: 12,
      reorderLevel: 25,
      imageBase64: placeholderBase64,
      supplier: "FilterPro",
      supplierContact: "info@filterpro.com",
      vehicleCompatibility: "Most domestic and import vehicles",
    },
    {
      name: "Spark Plugs",
      sku: "SPK-PLG-001",
      category: "Ignition",
      description: "Iridium spark plugs for better fuel efficiency",
      price: 8.99,
      purchasePrice: 4.5,
      stock: 120,
      reorderLevel: 30,
      imageBase64: placeholderBase64,
      supplier: "IgnitionTech",
      supplierContact: "orders@ignitiontech.com",
      vehicleCompatibility: "Check application guide for specific vehicles",
    },
    {
      name: "Engine Oil 5W-30",
      sku: "OIL-ENG-001",
      category: "Fluids",
      description: "Synthetic blend engine oil for all-season protection",
      price: 32.99,
      purchasePrice: 22.5,
      stock: 65,
      reorderLevel: 20,
      imageBase64: placeholderBase64,
      supplier: "LubriTech",
      supplierContact: "wholesale@lubritech.com",
      vehicleCompatibility: "All vehicles requiring 5W-30 oil",
    },
    {
      name: "Headlight Bulbs",
      sku: "LGT-BLB-001",
      category: "Lighting",
      description: "LED headlight bulbs for improved visibility",
      price: 19.99,
      purchasePrice: 12.25,
      stock: 42,
      reorderLevel: 15,
      imageBase64: placeholderBase64,
      supplier: "BrightVision",
      supplierContact: "sales@brightvision.com",
      vehicleCompatibility: "Universal fit with adapters included",
    },
    {
      name: "Transmission Fluid",
      sku: "FLD-TRN-001",
      category: "Fluids",
      description: "Automatic transmission fluid for smooth shifting",
      price: 22.99,
      purchasePrice: 14.75,
      stock: 3,
      reorderLevel: 10,
      imageBase64: placeholderBase64,
      supplier: "FluidMasters",
      supplierContact: "orders@fluidmasters.com",
      vehicleCompatibility: "Check vehicle manual for compatibility",
    },
  ]
  
  // Sample customers data
  const sampleCustomers: (Customer & { id: string })[] = [
    {
      id: "cust001",
      name: "Jackson Miller",
      email: "jackson.miller@example.com",
      phone: "555-123-4567",
      address: "123 Main St, Anytown, USA",
      totalPurchases: 1250.75,
      lastPurchase: Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 1000)), // 5 minutes ago
      status: "active",
      outstandingBalance: 0,
      joinDate: Timestamp.fromDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)), // 90 days ago
      notes: "Regular customer, prefers synthetic oil",
      avatarBase64: placeholderBase64,
      vehicles: [
        {
          make: "Toyota",
          model: "Camry",
          year: 2018,
          vin: "4T1B11HK5JU123456",
          licensePlate: "ABC123",
        },
      ],
    },
    {
      id: "cust002",
      name: "Sophia Davis",
      email: "sophia.davis@example.com",
      phone: "555-234-5678",
      address: "456 Oak Ave, Somewhere, USA",
      totalPurchases: 875.5,
      lastPurchase: Timestamp.fromDate(new Date(Date.now() - 12 * 60 * 1000)), // 12 minutes ago
      status: "active",
      outstandingBalance: 49.99,
      joinDate: Timestamp.fromDate(new Date(Date.now() - 120 * 24 * 60 * 60 * 1000)), // 120 days ago
      notes: "Prefers appointments on weekends",
      vehicles: [
        {
          make: "Honda",
          model: "Civic",
          year: 2020,
          vin: "2HGFC2F53LH123456",
          licensePlate: "XYZ789",
        },
      ],
    },
    {
      id: "cust003",
      name: "Oliver Wilson",
      email: "oliver.wilson@example.com",
      phone: "555-345-6789",
      address: "789 Pine St, Elsewhere, USA",
      totalPurchases: 2340.25,
      lastPurchase: Timestamp.fromDate(new Date(Date.now() - 25 * 60 * 1000)), // 25 minutes ago
      status: "active",
      outstandingBalance: 0,
      joinDate: Timestamp.fromDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)), // 60 days ago
      notes: "Fleet account, multiple vehicles",
      vehicles: [
        {
          make: "Ford",
          model: "F-150",
          year: 2019,
          vin: "1FTEW1EP5KFA12345",
          licensePlate: "TRK456",
        },
        {
          make: "Ford",
          model: "Explorer",
          year: 2021,
          vin: "1FMSK8DH3MGB12345",
          licensePlate: "SUV789",
        },
      ],
    },
    {
      id: "cust004",
      name: "Emma Martinez",
      email: "emma.martinez@example.com",
      phone: "555-456-7890",
      address: "101 Maple Dr, Anystate, USA",
      totalPurchases: 945.8,
      lastPurchase: Timestamp.fromDate(new Date(Date.now() - 42 * 60 * 1000)), // 42 minutes ago
      status: "active",
      outstandingBalance: 0,
      joinDate: Timestamp.fromDate(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)), // 45 days ago
      notes: "Prefers text message reminders",
      vehicles: [
        {
          make: "Chevrolet",
          model: "Equinox",
          year: 2017,
          vin: "2GNFLFEK4H6123456",
          licensePlate: "EQX123",
        },
      ],
    },
    {
      id: "cust005",
      name: "Liam Thompson",
      email: "liam.thompson@example.com",
      phone: "555-567-8901",
      address: "202 Cedar Ln, Othertown, USA",
      totalPurchases: 1875.35,
      lastPurchase: Timestamp.fromDate(new Date(Date.now() - 60 * 60 * 1000)), // 1 hour ago
      status: "active",
      outstandingBalance: 125.5,
      joinDate: Timestamp.fromDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)), // 180 days ago
      notes: "Prefers premium parts only",
      vehicles: [
        {
          make: "BMW",
          model: "X5",
          year: 2020,
          vin: "5UXCR6C56L9B12345",
          licensePlate: "LUX555",
        },
      ],
    },
  ]
  
  // Generate sample sales data
  const generateSampleSales = (products: Product[], customers: Customer[]): Sale[] => {
    const sales: Sale[] = []
  
    // Create a sale for each customer
    customers.forEach((customer, index) => {
      // Select 1-3 random products for this sale
      const numProducts = Math.floor(Math.random() * 3) + 1
      const saleItems: Sale["items"] = []
      let subtotal = 0
  
      for (let i = 0; i < numProducts; i++) {
        const randomProductIndex = Math.floor(Math.random() * products.length)
        const product = products[randomProductIndex]
        const quantity = Math.floor(Math.random() * 3) + 1
        const total = product.price * quantity
  
        saleItems.push({
          id: `item${i + 1}`,
          product: {
            id: product.id || `prod${randomProductIndex + 1}`,
            name: product.name,
            sku: product.sku,
          },
          quantity,
          unitPrice: product.price,
          total,
        })
  
        subtotal += total
      }
  
      const taxRate = 0.08
      const taxAmount = subtotal * taxRate
      const discount = index % 3 === 0 ? subtotal * 0.05 : 0 // Apply 5% discount to every 3rd customer
      const total = subtotal + taxAmount - discount
  
      // Create minutes ago based on customer index (first customer most recent)
      const minutesAgo = (index + 1) * 5
  
      sales.push({
        saleNumber: `SALE-${Date.now().toString().slice(-6)}-${index + 1}`,
        customer: {
          id: customer.id || `cust${index + 1}`,
          name: customer.name,
          email: customer.email,
        },
        date: Timestamp.fromDate(new Date(Date.now() - minutesAgo * 60 * 1000)),
        items: saleItems,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        total,
        paymentMethod: ["Credit Card", "Cash", "Debit Card"][Math.floor(Math.random() * 3)],
        status: "completed",
        notes: "",
      })
    })
  
    return sales
  }
  
  // Generate sample invoices data
  const generateSampleInvoices = (products: Product[], customers: Customer[]): Invoice[] => {
    const invoices: Invoice[] = []
  
    // Create an invoice for each customer
    customers.forEach((customer, index) => {
      // Select 2-4 random products for this invoice
      const numProducts = Math.floor(Math.random() * 3) + 2
      const invoiceItems: Invoice["items"] = []
      let subtotal = 0
  
      for (let i = 0; i < numProducts; i++) {
        const randomProductIndex = Math.floor(Math.random() * products.length)
        const product = products[randomProductIndex]
        const quantity = Math.floor(Math.random() * 3) + 1
        const total = product.price * quantity
  
        invoiceItems.push({
          id: `item${i + 1}`,
          product: {
            id: product.id || `prod${randomProductIndex + 1}`,
            name: product.name,
            sku: product.sku,
          },
          quantity,
          unitPrice: product.price,
          total,
        })
  
        subtotal += total
      }
  
      const taxRate = 0.08
      const taxAmount = subtotal * taxRate
      const discount = index % 2 === 0 ? subtotal * 0.1 : 0 // Apply 10% discount to every 2nd customer
      const total = subtotal + taxAmount - discount
  
      // Create days ago based on customer index
      const daysAgo = (index + 1) * 3
  
      // Set due date to 30 days after invoice date
      const invoiceDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      const dueDate = new Date(invoiceDate)
      dueDate.setDate(dueDate.getDate() + 30)
  
      // Determine status based on due date
      let status: "paid" | "pending" | "overdue" = "pending"
      if (index % 3 === 0) {
        status = "paid"
      } else if (dueDate < new Date()) {
        status = "overdue"
      }
  
      invoices.push({
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}-${index + 1}`,
        customer: {
          id: customer.id || `cust${index + 1}`,
          name: customer.name,
          email: customer.email,
        },
        date: Timestamp.fromDate(invoiceDate),
        dueDate: Timestamp.fromDate(dueDate),
        items: invoiceItems,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        total,
        status,
        paymentMethod:
          status === "paid" ? ["Credit Card", "Bank Transfer", "Check"][Math.floor(Math.random() * 3)] : undefined,
        notes: "",
        vehicle: customer.vehicles ? customer.vehicles[0] : undefined,
      })
    })
  
    return invoices
  }
  
  // Function to check if a collection is empty
  const isCollectionEmpty = async (collectionName: string): Promise<boolean> => {
    const q = query(collection(db, collectionName), limit(1))
    const snapshot = await getDocs(q)
    return snapshot.empty
  }
  
  // Function to clear a collection
  const clearCollection = async (collectionName: string): Promise<void> => {
    const snapshot = await getDocs(collection(db, collectionName))
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
  }
  
  // Main function to initialize Firestore with sample data
  export const initializeFirestore = async (): Promise<{ success: boolean; message: string }> => {
    try {
      // Check if collections already have data
      const productsEmpty = await isCollectionEmpty("products")
      const customersEmpty = await isCollectionEmpty("customers")
      const salesEmpty = await isCollectionEmpty("sales")
      const invoicesEmpty = await isCollectionEmpty("invoices")
  
      // If all collections are empty, proceed with initialization
      if (productsEmpty && customersEmpty && salesEmpty && invoicesEmpty) {
        // Add products
        const productPromises = sampleProducts.map(async (product, index) => {
          const productId = `prod${index + 1}`
          await setDoc(doc(db, "products", productId), {
            ...product,
            id: productId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
          return { ...product, id: productId }
        })
  
        const productsWithIds = await Promise.all(productPromises)
  
        // Add customers
        const customerPromises = sampleCustomers.map(async (customer) => {
          await setDoc(doc(db, "customers", customer.id), {
            ...customer,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
          return customer
        })
  
        const customersWithIds = await Promise.all(customerPromises)
  
        // Generate and add sales
        const sampleSales = generateSampleSales(productsWithIds, customersWithIds)
        const salesPromises = sampleSales.map(async (sale, index) => {
          const saleId = `sale${index + 1}`
          await setDoc(doc(db, "sales", saleId), {
            ...sale,
            id: saleId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        })
  
        await Promise.all(salesPromises)
  
        // Generate and add invoices
        const sampleInvoices = generateSampleInvoices(productsWithIds, customersWithIds)
        const invoicePromises = sampleInvoices.map(async (invoice, index) => {
          const invoiceId = `inv${index + 1}`
          await setDoc(doc(db, "invoices", invoiceId), {
            ...invoice,
            id: invoiceId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        })
  
        await Promise.all(invoicePromises)
  
        return {
          success: true,
          message: `Database initialized successfully with ${productsWithIds.length} products, ${customersWithIds.length} customers, ${sampleSales.length} sales, and ${sampleInvoices.length} invoices.`,
        }
      } else {
        // If collections already have data, ask if user wants to clear and reinitialize
        return {
          success: false,
          message: "Database already contains data. Please clear collections first if you want to reinitialize.",
        }
      }
    } catch (error) {
      console.error("Error initializing Firestore:", error)
      return {
        success: false,
        message: `Error initializing database: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }
  
  // Function to clear and reinitialize the database
  export const clearAndReinitializeFirestore = async (): Promise<{ success: boolean; message: string }> => {
    try {
      // Clear all collections
      await clearCollection("products")
      await clearCollection("customers")
      await clearCollection("sales")
      await clearCollection("invoices")
  
      // Reinitialize with sample data
      return await initializeFirestore()
    } catch (error) {
      console.error("Error clearing and reinitializing Firestore:", error)
      return {
        success: false,
        message: `Error clearing and reinitializing database: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }
  