const vocabService = require('../../services/vocab.service');

exports.getVocabById = async (req, res) => {
  const { id } = req.params;

  try {
    const vocab = await vocabService.getVocabById(id);
    if (!vocab) {
      return res.status(404).json({ message: 'Vocab not found.' });
    }
    res.status(200).json(vocab);
  } catch (error) {
    console.error('Error fetching vocab by ID:', error);
    res.status(500).json({ message: 'Failed to retrieve vocab.' });
  }
};

exports.getAllVocabs = async (req, res) => {
  try {
    const { page = 1, size = 10, search = '', sort, filters } = req.body;
    const result = await vocabService.getAllVocabs(
      parseInt(page),
      parseInt(size),
      search,
      filters,
      sort
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching vocabs:', error);
    res.status(500).json({ message: 'Failed to retrieve vocabs.' });
  }
};

exports.createVocab = async (req, res) => {
  try {
    const newVocab = await vocabService.createVocab(req.body);
    res.status(200).json(newVocab);
  } catch (error) {
    console.error('Error creating vocab:', error);
    res.status(500).json({ message: 'Failed to create vocab.' });
  }
};

exports.updateVocab = async (req, res) => {
  try {
    const updatedVocab = await vocabService.updateVocab(req.params.id, req.body);
    res.status(200).json(updatedVocab);
  } catch (error) {
    console.error('Error updating vocab:', error);
    res.status(500).json({ message: 'Failed to update vocab.' });
  }
};

exports.deleteVocab = async (req, res) => {
  try {
    await vocabService.deleteVocab(req.params.id);
    res.status(200).send();
  } catch (error) {
    console.error('Error deleting vocab:', error);
    res.status(500).json({ message: 'Failed to delete vocab.' });
  }
};
