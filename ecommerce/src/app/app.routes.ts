 import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { LandingProductComponent } from './pages/guest-view/landing-product/landing-product.component';
import { authGuard } from './pages/auth/service/auth.guard';
import { CartComponent } from './pages/view-auth/cart/cart.component';
import { CheckoutComponent } from './pages/view-auth/checkout/checkout.component';
import { ThankYouOrderComponent } from './pages/view-auth/thank-you-order/thank-you-order.component';
import { ProfileClientComponent } from './pages/view-auth/profile-client/profile-client.component';
import { FilterAdvanceComponent } from './pages/guest-view/filter-advance/filter-advance.component';
import { CampaingLinkComponent } from './pages/guest-view/campaing-link/campaing-link.component';
import { CompareProductComponent } from './pages/guest-view/compare-product/compare-product.component';
import { ContactoComponent } from './pages/guest-view/contacto/contacto.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        // canActivate: [authGuard],
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'cambiar-credenciales',
        component: ForgotPasswordComponent
    }
    ,
    {
        path: 'producto/:slug',
        component: LandingProductComponent
    },
    {
        canActivate: [authGuard],
        path: 'carrito-de-compra',
        component: CartComponent
    },
    {
        canActivate: [authGuard],
        path: 'proceso-de-pago',
        component: CheckoutComponent
    },
    {
        canActivate: [authGuard],
        path: 'gracias-por-tu-compra/:order',
        component: ThankYouOrderComponent
    },
    {
        canActivate: [authGuard],
        path: 'perfil-del-cliente',
        component: ProfileClientComponent,
    },
    {
        path: 'productos-busqueda',
        component: FilterAdvanceComponent,
    },
    {
        path: 'shop',
        component: FilterAdvanceComponent,
    },
    {
        path: 'contacto',
        component: ContactoComponent,
    },
    {
        path: 'discount/:code',
        component: CampaingLinkComponent,
    },
    {
        path: 'compare-product',
        component: CompareProductComponent,
    },
];
