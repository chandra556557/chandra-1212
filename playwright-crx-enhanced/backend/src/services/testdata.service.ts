/**
 * Test Data Management Service
 * Generates intelligent test data using templates and patterns
 */

import { randomUUID } from 'crypto';

export interface TestDataGenerationRequest {
  dataType: 'user' | 'product' | 'order' | 'transaction' | 'custom';
  count: number;
  schema?: Record<string, any>;
  locale?: string;
  options?: {
    includeEdgeCases?: boolean;
    includeNullValues?: boolean;
    includeSpecialChars?: boolean;
  };
}

export interface TestDataset {
  id: string;
  name: string;
  dataType: string;
  records: any[];
  schema?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export class TestDataService {
  private firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'Robert', 'Olivia', 'William', 'Ava', 'Richard', 'Sophia', 'Joseph'];
  private lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas'];
  private cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
  private states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'GA', 'NC'];
  private categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports & Outdoors', 'Toys', 'Automotive', 'Health & Beauty', 'Food & Beverage', 'Office'];
  private productAdjectives = ['Premium', 'Professional', 'Deluxe', 'Ultra', 'Smart', 'Advanced', 'Classic', 'Modern', 'Eco-Friendly', 'Wireless'];
  private productNouns = ['Laptop', 'Phone', 'Tablet', 'Watch', 'Camera', 'Speaker', 'Headphones', 'Keyboard', 'Mouse', 'Monitor'];

  /**
   * Generate test data based on request
   */
  async generateTestData(request: TestDataGenerationRequest): Promise<{
    success: boolean;
    data: any[];
    metadata: {
      generatedCount: number;
      dataType: string;
      processingTime: number;
    };
  }> {
    const startTime = Date.now();
    const data: any[] = [];

    try {
      for (let i = 0; i < request.count; i++) {
        const record = this.generateRecord(request.dataType, i, request);
        data.push(record);
      }

      // Add edge cases if requested
      if (request.options?.includeEdgeCases && data.length > 0) {
        const edgeCases = this.generateEdgeCases(request.dataType);
        data.push(...edgeCases.slice(0, Math.min(3, request.count)));
      }

      return {
        success: true,
        data: data.slice(0, request.count),
        metadata: {
          generatedCount: data.length,
          dataType: request.dataType,
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      console.error('Test data generation error:', error);
      throw new Error('Failed to generate test data');
    }
  }

  /**
   * Generate a single record based on type
   */
  private generateRecord(dataType: string, index: number, request: TestDataGenerationRequest): any {
    switch (dataType) {
      case 'user':
        return this.generateUser(index, request.options);
      case 'product':
        return this.generateProduct(index, request.options);
      case 'order':
        return this.generateOrder(index, request.options);
      case 'transaction':
        return this.generateTransaction(index, request.options);
      case 'custom':
        return this.generateCustom(index, request.schema, request.options);
      default:
        return this.generateUser(index, request.options);
    }
  }

  /**
   * Generate user test data
   */
  private generateUser(index: number, _options?: any): any {
    const firstName = this.randomChoice(this.firstNames);
    const lastName = this.randomChoice(this.lastNames);
    const domain = this.randomChoice(['gmail.com', 'yahoo.com', 'outlook.com', 'company.com']);
    
    return {
      id: randomUUID(),
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index > 0 ? index : ''}@${domain}`,
      username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`,
      phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      dateOfBirth: this.randomDate(new Date(1960, 0, 1), new Date(2005, 11, 31)),
      age: Math.floor(Math.random() * 50) + 18,
      address: {
        street: `${Math.floor(Math.random() * 9999) + 1} ${this.randomChoice(['Main', 'Oak', 'Maple', 'Elm', 'Pine'])} ${this.randomChoice(['St', 'Ave', 'Blvd', 'Dr'])}`,
        city: this.randomChoice(this.cities),
        state: this.randomChoice(this.states),
        zipCode: String(Math.floor(Math.random() * 90000) + 10000),
        country: 'USA'
      },
      role: this.randomChoice(['admin', 'user', 'guest', 'moderator']),
      status: this.randomChoice(['active', 'inactive', 'pending', 'suspended']),
      emailVerified: Math.random() > 0.3,
      preferences: {
        newsletter: Math.random() > 0.5,
        notifications: Math.random() > 0.3,
        theme: this.randomChoice(['light', 'dark', 'auto'])
      },
      createdAt: this.randomDate(new Date(2020, 0, 1), new Date()),
      lastLogin: this.randomDate(new Date(2024, 0, 1), new Date())
    };
  }

  /**
   * Generate product test data
   */
  private generateProduct(index: number, _options?: any): any {
    const adj = this.randomChoice(this.productAdjectives);
    const noun = this.randomChoice(this.productNouns);
    const category = this.randomChoice(this.categories);
    const price = Math.round((Math.random() * 1000 + 10) * 100) / 100;

    return {
      id: randomUUID(),
      name: `${adj} ${noun}`,
      description: `High-quality ${adj.toLowerCase()} ${noun.toLowerCase()} with excellent features and performance`,
      category,
      subCategory: this.randomChoice(['Featured', 'New Arrivals', 'Best Sellers', 'Clearance']),
      price,
      originalPrice: Math.round((price * (1 + Math.random() * 0.3)) * 100) / 100,
      currency: 'USD',
      sku: `SKU-${String(index + 1000).padStart(6, '0')}`,
      barcode: String(Math.floor(Math.random() * 9000000000000) + 1000000000000),
      stock: Math.floor(Math.random() * 200),
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      reviewCount: Math.floor(Math.random() * 500),
      imageUrl: `https://picsum.photos/400/400?random=${index}`,
      images: [
        `https://picsum.photos/400/400?random=${index}`,
        `https://picsum.photos/400/400?random=${index + 1000}`,
        `https://picsum.photos/400/400?random=${index + 2000}`
      ],
      tags: this.randomChoices(['new', 'sale', 'featured', 'bestseller', 'trending', 'limited'], Math.floor(Math.random() * 3) + 1),
      dimensions: {
        width: Math.round(Math.random() * 50 + 5),
        height: Math.round(Math.random() * 50 + 5),
        depth: Math.round(Math.random() * 50 + 5),
        unit: 'cm'
      },
      weight: Math.round((Math.random() * 10 + 0.1) * 100) / 100,
      weightUnit: 'kg',
      isActive: Math.random() > 0.1,
      isFeatured: Math.random() > 0.7,
      createdAt: this.randomDate(new Date(2023, 0, 1), new Date()),
      updatedAt: this.randomDate(new Date(2024, 0, 1), new Date())
    };
  }

  /**
   * Generate order test data
   */
  private generateOrder(index: number, _options?: any): any {
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const items = [];
    let totalAmount = 0;

    for (let i = 0; i < itemCount; i++) {
      const quantity = Math.floor(Math.random() * 5) + 1;
      const price = Math.round((Math.random() * 200 + 10) * 100) / 100;
      items.push({
        productId: randomUUID(),
        productName: `${this.randomChoice(this.productAdjectives)} ${this.randomChoice(this.productNouns)}`,
        quantity,
        price,
        subtotal: Math.round(quantity * price * 100) / 100
      });
      totalAmount += quantity * price;
    }

    const tax = Math.round(totalAmount * 0.08 * 100) / 100;
    const shipping = Math.round((Math.random() * 20 + 5) * 100) / 100;
    totalAmount = Math.round((totalAmount + tax + shipping) * 100) / 100;

    const orderDateObj = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const orderDate = orderDateObj.toISOString();
    const status = this.randomChoice(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']);
    
    return {
      id: randomUUID(),
      orderNumber: `ORD-${String(index + 10000).padStart(8, '0')}`,
      userId: randomUUID(),
      items,
      subtotal: Math.round((totalAmount - tax - shipping) * 100) / 100,
      tax,
      shipping,
      totalAmount,
      currency: 'USD',
      status,
      paymentMethod: this.randomChoice(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery']),
      paymentStatus: this.randomChoice(['pending', 'completed', 'failed', 'refunded']),
      shippingAddress: {
        fullName: `${this.randomChoice(this.firstNames)} ${this.randomChoice(this.lastNames)}`,
        street: `${Math.floor(Math.random() * 9999) + 1} Shipping Lane`,
        city: this.randomChoice(this.cities),
        state: this.randomChoice(this.states),
        zipCode: String(Math.floor(Math.random() * 90000) + 10000),
        country: 'USA',
        phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`
      },
      billingAddress: {
        fullName: `${this.randomChoice(this.firstNames)} ${this.randomChoice(this.lastNames)}`,
        street: `${Math.floor(Math.random() * 9999) + 1} Billing Ave`,
        city: this.randomChoice(this.cities),
        state: this.randomChoice(this.states),
        zipCode: String(Math.floor(Math.random() * 90000) + 10000),
        country: 'USA'
      },
      trackingNumber: status === 'shipped' || status === 'delivered' ? `TRK-${String(Math.floor(Math.random() * 9000000000) + 1000000000)}` : null,
      orderDate,
      confirmedAt: ['confirmed', 'processing', 'shipped', 'delivered'].includes(status) ? new Date(orderDateObj.getTime() + Math.random() * 86400000).toISOString() : null,
      shippedAt: ['shipped', 'delivered'].includes(status) ? new Date(orderDateObj.getTime() + Math.random() * 172800000).toISOString() : null,
      deliveredAt: status === 'delivered' ? new Date(orderDateObj.getTime() + Math.random() * 604800000).toISOString() : null,
      notes: Math.random() > 0.7 ? 'Please handle with care' : null
    };
  }

  /**
   * Generate transaction test data
   */
  private generateTransaction(index: number, _options?: any): any {
    const amount = Math.round((Math.random() * 5000 + 10) * 100) / 100;
    const transactionDateObj = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const transactionDate = transactionDateObj.toISOString();
    const txStatus = this.randomChoice(['pending', 'completed', 'failed', 'cancelled']);
    
    return {
      id: randomUUID(),
      transactionId: `TXN-${String(index + 100000).padStart(10, '0')}`,
      userId: randomUUID(),
      orderId: randomUUID(),
      type: this.randomChoice(['payment', 'refund', 'chargeback', 'adjustment']),
      amount,
      currency: 'USD',
      status: txStatus,
      paymentMethod: this.randomChoice(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'wallet']),
      cardLast4: String(Math.floor(Math.random() * 9000) + 1000),
      cardBrand: this.randomChoice(['Visa', 'Mastercard', 'American Express', 'Discover']),
      gateway: this.randomChoice(['Stripe', 'PayPal', 'Square', 'Authorize.Net']),
      gatewayTransactionId: `GTW-${randomUUID()}`,
      description: `Payment for order #${Math.floor(Math.random() * 90000) + 10000}`,
      fee: Math.round(amount * 0.029 * 100) / 100,
      netAmount: Math.round((amount - (amount * 0.029)) * 100) / 100,
      transactionDate,
      completedAt: txStatus === 'completed' ? new Date(transactionDateObj.getTime() + Math.random() * 3600000).toISOString() : null,
      metadata: {
        ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        risk_score: Math.round(Math.random() * 100)
      }
    };
  }

  /**
   * Generate custom data based on schema
   */
  private generateCustom(index: number, schema?: Record<string, any>, _options?: any): any {
    if (!schema) {
      return {
        id: randomUUID(),
        field1: `value-${index}`,
        field2: Math.floor(Math.random() * 1000),
        field3: Math.random() > 0.5,
        createdAt: new Date().toISOString()
      };
    }

    const record: any = {};
    for (const [key, type] of Object.entries(schema)) {
      record[key] = this.generateFieldValue(type as string, index);
    }
    return record;
  }

  /**
   * Generate field value based on type
   */
  private generateFieldValue(type: string, index: number): any {
    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('uuid') || lowerType.includes('id')) {
      return randomUUID();
    } else if (lowerType.includes('email')) {
      return `user${index}@example.com`;
    } else if (lowerType.includes('phone')) {
      return `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
    } else if (lowerType.includes('url')) {
      return `https://example.com/${index}`;
    } else if (lowerType.includes('date') || lowerType.includes('timestamp')) {
      return this.randomDate(new Date(2020, 0, 1), new Date());
    } else if (lowerType.includes('number') || lowerType.includes('int')) {
      return Math.floor(Math.random() * 1000);
    } else if (lowerType.includes('float') || lowerType.includes('decimal')) {
      return Math.round(Math.random() * 1000 * 100) / 100;
    } else if (lowerType.includes('bool')) {
      return Math.random() > 0.5;
    } else {
      return `value-${index}`;
    }
  }

  /**
   * Generate edge cases
   */
  private generateEdgeCases(dataType: string): any[] {
    const cases: any[] = [];

    if (dataType === 'user') {
      cases.push({
        id: randomUUID(),
        firstName: '',
        lastName: 'O\'Brien',
        email: 'test+special@example.com',
        username: 'a',
        phone: '+11234567890',
        dateOfBirth: '1900-01-01',
        age: 124,
        address: {
          street: '1 A',
          city: 'X',
          state: 'XX',
          zipCode: '00000',
          country: 'USA'
        },
        role: 'admin',
        status: 'active',
        emailVerified: false,
        preferences: {
          newsletter: false,
          notifications: false,
          theme: 'light'
        },
        createdAt: new Date('2020-01-01').toISOString(),
        lastLogin: new Date().toISOString()
      });
    } else if (dataType === 'product') {
      cases.push({
        id: randomUUID(),
        name: 'A',
        description: '',
        category: 'Electronics',
        subCategory: 'Featured',
        price: 0.01,
        originalPrice: 0.01,
        currency: 'USD',
        sku: 'SKU-000000',
        barcode: '0000000000000',
        stock: 0,
        rating: 0,
        reviewCount: 0,
        imageUrl: '',
        images: [],
        tags: [],
        dimensions: { width: 0, height: 0, depth: 0, unit: 'cm' },
        weight: 0.01,
        weightUnit: 'kg',
        isActive: false,
        isFeatured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return cases;
  }

  /**
   * Helper: Random choice from array
   */
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Helper: Random multiple choices from array
   */
  private randomChoices<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Helper: Random date between range
   */
  private randomDate(start: Date, end: Date): string {
    const timestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(timestamp).toISOString();
  }
}
