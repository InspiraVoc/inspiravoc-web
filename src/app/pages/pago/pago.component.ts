import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.css']
})
export class PagoComponent implements OnInit {
  pasoActual: number = 1;
  metodoPagoSeleccionado: string = '';
  codigoDescuento: string = '';
  totalBase: number = 0;
  totalConDescuento: number = 0;

  mensajeAlerta: string = '';
  mostrarAlerta: boolean = false;

  carritoItems: any[] = [];

  tarjeta = {
    numero: '1234 5678 9876 5432',
    fechaExpiracion: '12/25',
    cvv: '123',
    saldo: 100, 
  };
  
  envioDatos = {
    pais: '',
    ciudad: '',
    codigoPostal: '',
    nombre: '',
    email: ''
  };
  
  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.totalBase = this.calcularTotalBase();
    this.totalConDescuento = this.totalBase;

    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.envioDatos.nombre = user.firstName;
        this.envioDatos.email = user.email;
      }
    });

    this.eventService.carritoItem$.subscribe((items) => {
      console.log('Actualización de items en carrito:', items);
      this.carritoItems = items;
      this.totalBase = this.calcularTotalBase();
      this.totalConDescuento = this.totalBase;
      this.cdr.detectChanges();
    });
  }

  calcularTotalBase(): number {
    return this.carritoItems.reduce((acc, item) => acc + item.precio, 0);
  }

  cambiarPaso(nuevoPaso: number) {
    this.pasoActual = nuevoPaso;
  }

  seleccionarMetodoPago(metodo: string) {
    this.metodoPagoSeleccionado = metodo;
  }

  aplicarDescuento() {
    const descuentoEstudiantes = 'GRUPO30';
    const descuentoUsoContinuo = 'USUARIO15';

    if (this.codigoDescuento === descuentoEstudiantes) {
      this.totalConDescuento = this.totalBase * 0.7;
      this.mensajeAlerta = 'Descuento de 30% aplicado para estudiantes en grupo';
    } else if (this.codigoDescuento === descuentoUsoContinuo) {
      this.totalConDescuento = this.totalBase * 0.85;
      this.mensajeAlerta = 'Descuento de 15% aplicado para uso continuo';
    } else {
      this.mensajeAlerta = 'Código de descuento no válido';
      this.totalConDescuento = this.totalBase;
    }

    this.mostrarAlerta = true;
  }

  cerrarAlerta() {
    this.mostrarAlerta = false;
  }

  placeOrder() {
    if (this.totalConDescuento > this.tarjeta.saldo) {
      this.mensajeAlerta = "Saldo insuficiente para realizar la compra";
      this.mostrarAlerta = true;
    } else {
      this.tarjeta.saldo -= this.totalConDescuento; 
      this.mensajeAlerta = "Compra realizada con éxito";
      this.mostrarAlerta = true;
      this.vaciarCarrito();
      this.cambiarPaso(1);
    }
  }

  vaciarCarrito() {
    this.carritoItems = [];
    this.totalBase = 0;
    this.totalConDescuento = 0;
  }
}

