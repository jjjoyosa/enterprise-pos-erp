import Sequence from '../modules/sales/models/Sequence'; 

export const getNextOfficialReceiptNumber = async (tenantId: string): Promise<string> => {
  
  const sequenceDoc = await Sequence.findOneAndUpdate(
    { tenantId, type: 'SI_NUMBER' }, 
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true } 
  );

  const paddedSequence = sequenceDoc.sequence_value.toString().padStart(9, '0');
  
  return `SI-${paddedSequence}`;
};

export const generateZReadingNumber = async (tenantId: string): Promise<string> => {
  const sequenceDoc = await Sequence.findOneAndUpdate(
    { tenantId, type: 'Z_NUMBER' }, 
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true } 
  );

  const paddedSequence = sequenceDoc.sequence_value.toString().padStart(9, '0');
  return `Z-${paddedSequence}`;
};