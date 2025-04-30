import React from 'react';
import { SessionProvider } from '../context/sessions_context';
import { CartProvider } from '../context/cart_context';
import { PetProvider } from './pet_context';
import { CategoryProvider } from './category_context';
import { SubcategoryProvider } from './subcategory_context';
import { GroomingProvider } from './grooming_context';
import { BookingProvider } from './booking_context';
import { OrderProvider } from './order_context';
import { ConversationsProvider } from '../realtime/conversations';
import { MessagesProvider } from '../realtime/messages';
import { TypingProvider } from '../realtime/typing-status';

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <SessionProvider>
      <CategoryProvider>
        <SubcategoryProvider>
          <GroomingProvider>
            <BookingProvider>
              <OrderProvider>
                <CartProvider>
                  <PetProvider>
                    <ConversationsProvider>
                      <MessagesProvider>
                        <TypingProvider>
                          {children}
                        </TypingProvider>
                      </MessagesProvider>
                    </ConversationsProvider>
                  </PetProvider>
                </CartProvider>
              </OrderProvider>
            </BookingProvider>
          </GroomingProvider>
        </SubcategoryProvider>
      </CategoryProvider>
    </SessionProvider>
  );
};

export default Providers;
