import { Request, Response } from 'express';
import ContactUsModel, { IContactUs } from '../models/contactUs.model'; // Adjust path
import { ContactQueryStatus, ContactQueryType } from '../common/enums'; // Adjust path
import { isValidObjectId } from 'mongoose';

// Extend Express Request interface if you are attaching user info to requests
interface AuthenticatedRequest extends Request {
  user?: { // This structure depends on your auth middleware
    id: string;
    role: string; // Assuming role is available for admin checks
  };
}

// --- Create a New Contact Query (User) ---
export const createContactQuery = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, email, phone, queryType, description } = req.body;

  // Basic validation
  if (!name || !email || !queryType || !description) {
    res.status(400).json({ message: 'Name, email, query type, and description are required.' });
    return;
  }

  if (!Object.values(ContactQueryType).includes(queryType as ContactQueryType)) {
      res.status(400).json({ message: 'Invalid query type provided.' });
      return;
  }

  try {
    let userId;
    // If user is authenticated (e.g., through your auth middleware), associate their ID
    if (req.user && req.user.id && isValidObjectId(req.user.id)) {
        userId = req.user.id;
    }

    const newQuery = await ContactUsModel.create({
      name,
      email,
      phone,
      queryType,
      description,
      userId, // Will be undefined if user is not logged in or ID is invalid
      status: ContactQueryStatus.UNREAD, // Default status
    });
    console.log(`[Contact Us] New query created with ID: ${newQuery._id}`);

    res.status(201).json({
      message: 'Your query has been submitted successfully. We will get back to you soon.',
      data: {
        id: newQuery._id,
        name: newQuery.name,
        email: newQuery.email,
        queryType: newQuery.queryType,
        status: newQuery.status,
        createdAt: newQuery.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[Contact Us] Error creating query:', error);
    if (error.name === 'ValidationError') {
        res.status(400).json({ message: 'Validation Error', errors: error.errors });
    } else {
        res.status(500).json({ message: `Failed to submit query: ${error.message || 'An unexpected error occurred.'}` });
    }
  }
};

// --- Get All Contact Queries (Admin) ---
export const getAllContactQueries = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status, queryType, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

  // Admin check (assuming you have middleware that sets req.user.role)
  // if (req.user?.role !== 'admin') {
  //   res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  //   return;
  // }

  try {
    const query: any = {};
    if (status && Object.values(ContactQueryStatus).includes(status as ContactQueryStatus)) {
      query.status = status as ContactQueryStatus;
    }
    if (queryType && Object.values(ContactQueryType).includes(queryType as ContactQueryType)) {
        query.queryType = queryType as ContactQueryType;
    }

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions: any = {};
    if (typeof sortBy === 'string') {
        sortOptions[sortBy] = sortOrder;
    } else {
        sortOptions['createdAt'] = -1; // Default sort
    }


    const queries = await ContactUsModel.find(query)
      .populate('userId', 'username email') // Optionally populate user details if userId exists
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)
      .lean(); // Use .lean() for faster queries if you don't need Mongoose documents

    const totalQueries = await ContactUsModel.countDocuments(query);
    const totalPages = Math.ceil(totalQueries / limitNumber);

    console.log(`[Contact Us] Fetched ${queries.length} queries for admin.`);
    res.status(200).json({
      message: 'Contact queries retrieved successfully.',
      data: queries,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalQueries,
        limit: limitNumber,
      }
    });
  } catch (error: any) {
    console.error('[Contact Us] Error fetching all queries:', error);
    res.status(500).json({ message: `Failed to retrieve queries: ${error.message || 'An unexpected error occurred.'}` });
  }
};

// --- Get a Single Contact Query by ID (Admin) ---
export const getContactQueryById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  // Admin check
  // if (req.user?.role !== 'admin') {
  //   res.status(403).json({ message: 'Access denied.' });
  //   return;
  // }

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid query ID format.' });
    return;
  }

  try {
    const query = await ContactUsModel.findById(id).populate('userId', 'username email');
    if (!query) {
      console.warn(`[Contact Us] Query with ID: ${id} not found.`);
      res.status(404).json({ message: 'Contact query not found.' });
      return;
    }
    console.log(`[Contact Us] Fetched query with ID: ${id}`);
    res.status(200).json({ message: 'Query retrieved successfully.', data: query });
  } catch (error: any) {
    console.error(`[Contact Us] Error fetching query by ID ${id}:`, error);
    res.status(500).json({ message: `Failed to retrieve query: ${error.message || 'An unexpected error occurred.'}` });
  }
};

// --- Get Contact Queries by User ID (Authenticated User for their own, or Admin for any) ---
export const getContactQueriesByUserId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(userId)) {
    res.status(400).json({ message: 'Invalid user ID format.' });
    return;
  }

  // Authorization: Check if the logged-in user is requesting their own queries or if they are an admin
  // if (req.user?.id !== userId && req.user?.role !== 'admin') {
  //   res.status(403).json({ message: 'Access denied. You can only view your own contact queries.' });
  //   return;
  // }

  try {
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const queries = await ContactUsModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const totalQueries = await ContactUsModel.countDocuments({ userId });
    const totalPages = Math.ceil(totalQueries / limitNumber);

    if (queries.length === 0) {
      console.log(`[Contact Us] No queries found for user ID: ${userId}`);
      // res.status(404).json({ message: 'No contact queries found for this user.' });
      // return;
    } else {
        console.log(`[Contact Us] Fetched ${queries.length} queries for user ID: ${userId}`);
    }


    res.status(200).json({
      message: 'User contact queries retrieved successfully.',
      data: queries,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalQueries,
        limit: limitNumber,
      }
    });
  } catch (error: any) {
    console.error(`[Contact Us] Error fetching queries for user ${userId}:`, error);
    res.status(500).json({ message: `Failed to retrieve user queries: ${error.message || 'An unexpected error occurred.'}` });
  }
};

// --- Update Contact Query Status (Admin) ---
export const updateContactQueryStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  // Admin check
  // if (req.user?.role !== 'admin') {
  //   res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  //   return;
  // }

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid query ID format.' });
    return;
  }

  if (!status || !Object.values(ContactQueryStatus).includes(status as ContactQueryStatus)) {
    res.status(400).json({ message: 'Invalid or missing status provided.' });
    return;
  }

  try {
    const query = await ContactUsModel.findById(id);
    if (!query) {
      console.warn(`[Contact Us] Attempt to update status for non-existent query ID: ${id}`);
      res.status(404).json({ message: 'Contact query not found.' });
      return;
    }

    query.status = status as ContactQueryStatus;
    if (adminNotes !== undefined) { // Allow clearing notes by passing empty string or updating
        query.adminNotes = adminNotes;
    }
    await query.save();

    console.log(`[Contact Us] Query ID: ${id} status updated to ${status}. Admin notes updated.`);
    res.status(200).json({ message: 'Query status updated successfully.', data: query });
  } catch (error: any) {
    console.error(`[Contact Us] Error updating status for query ID ${id}:`, error);
     if (error.name === 'ValidationError') {
        res.status(400).json({ message: 'Validation Error', errors: error.errors });
    } else {
        res.status(500).json({ message: `Failed to update query status: ${error.message || 'An unexpected error occurred.'}` });
    }
  }
};

// --- Delete a Contact Query (Admin) ---
export const deleteContactQuery = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    // Admin check
    // if (req.user?.role !== 'admin') {
    //   res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    //   return;
    // }

    if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid query ID format.' });
        return;
    }

    try {
        const query = await ContactUsModel.findByIdAndDelete(id);

        if (!query) {
            console.warn(`[Contact Us] Attempt to delete non-existent query ID: ${id}`);
            res.status(404).json({ message: 'Contact query not found.' });
            return;
        }

        console.log(`[Contact Us] Query ID: ${id} deleted successfully.`);
        res.status(200).json({ message: 'Query deleted successfully.', data: { id: query._id } });
    } catch (error: any) {
        console.error(`[Contact Us] Error deleting query ID ${id}:`, error);
        res.status(500).json({ message: `Failed to delete query: ${error.message || 'An unexpected error occurred.'}` });
    }
};