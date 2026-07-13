import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTransactionDto, CreateTransactionItemDto } from './create-transaction.dto';

describe('CreateTransactionDto', () => {
  it('validates a transaction creation payload', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      customerName: 'Luis Munar',
      customerEmail: 'luis@example.test',
      items: [
        {
          productId: 'a5b95f3f-74ad-4f0d-9730-8b1f463a5a49',
          quantity: 2,
        },
      ],
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.items[0]).toBeInstanceOf(CreateTransactionItemDto);
  });

  it('rejects empty items and invalid nested products', async () => {
    const emptyCartDto = plainToInstance(CreateTransactionDto, {
      customerName: 'Luis Munar',
      customerEmail: 'luis@example.test',
      items: [],
    });
    const invalidItemDto = plainToInstance(CreateTransactionDto, {
      customerName: 'Luis Munar',
      customerEmail: 'luis@example.test',
      items: [
        {
          productId: 'not-a-uuid',
          quantity: 0,
        },
      ],
    });

    const emptyCartErrors = await validate(emptyCartDto);
    const invalidItemErrors = await validate(invalidItemDto);

    expect(emptyCartErrors).toHaveLength(1);
    expect(invalidItemErrors).toHaveLength(1);
    expect(invalidItemErrors[0].children?.[0].children).toHaveLength(2);
  });

  it('rejects invalid customer email', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      customerName: 'Luis Munar',
      customerEmail: 'invalid-email',
      items: [
        {
          productId: 'a5b95f3f-74ad-4f0d-9730-8b1f463a5a49',
          quantity: 1,
        },
      ],
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('customerEmail');
  });
});
