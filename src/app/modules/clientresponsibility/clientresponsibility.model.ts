import { Schema, model } from 'mongoose';
import { IClientResponsibility } from './clientresponsibility.interface';

const clientResponsibilitySchema = new Schema<IClientResponsibility>({
  // Define schema fields here
  name: {
    type: String,
    required: true,
  },
});

export const ClientResponsibility = model<IClientResponsibility>('Clientresponsibility', clientResponsibilitySchema);
