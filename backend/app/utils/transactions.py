"""Database transaction utilities and context managers."""

from contextlib import contextmanager
from typing import Generator
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from .logging import get_logger

logger = get_logger("transactions")


@contextmanager
def db_transaction(db: Session) -> Generator[Session, None, None]:
    """
    Context manager for database transactions with automatic rollback.
    
    Args:
        db: SQLAlchemy database session
        
    Yields:
        Database session
        
    Raises:
        SQLAlchemyError: For database-related errors
        Exception: For any other errors during transaction
    """
    try:
        logger.debug("Starting database transaction")
        yield db
        db.commit()
        logger.debug("Transaction committed successfully")
    except IntegrityError as e:
        logger.error(f"Database integrity error: {str(e)}")
        db.rollback()
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"Unexpected error in transaction: {str(e)}")
        db.rollback()
        raise


@contextmanager
def safe_db_operation(db: Session, operation_name: str) -> Generator[Session, None, None]:
    """
    Context manager for safe database operations with logging.
    
    Args:
        db: SQLAlchemy database session
        operation_name: Name of the operation for logging
        
    Yields:
        Database session
    """
    try:
        logger.info(f"Starting operation: {operation_name}")
        start_time = logger.performance.__enter__() if hasattr(logger, 'performance') else None
        
        yield db
        
        if start_time:
            logger.performance(operation_name, start_time)
        
        logger.info(f"Operation completed: {operation_name}")
    except Exception as e:
        logger.error(f"Operation failed: {operation_name} - {str(e)}")
        raise


def safe_commit(db: Session, operation_name: str = "database operation") -> bool:
    """
    Safely commit database changes with error handling.
    
    Args:
        db: SQLAlchemy database session
        operation_name: Name of the operation for logging
        
    Returns:
        True if commit successful, False otherwise
    """
    try:
        db.commit()
        logger.debug(f"Successfully committed: {operation_name}")
        return True
    except IntegrityError as e:
        logger.error(f"Integrity error during {operation_name}: {str(e)}")
        db.rollback()
        return False
    except SQLAlchemyError as e:
        logger.error(f"Database error during {operation_name}: {str(e)}")
        db.rollback()
        return False
    except Exception as e:
        logger.error(f"Unexpected error during {operation_name}: {str(e)}")
        db.rollback()
        return False


def safe_delete(db: Session, model_instance, soft_delete: bool = True) -> bool:
    """
    Safely delete a model instance with error handling.
    
    Args:
        db: SQLAlchemy database session
        model_instance: Model instance to delete
        soft_delete: Whether to use soft delete (set is_active=False) or hard delete
        
    Returns:
        True if deletion successful, False otherwise
    """
    try:
        if soft_delete and hasattr(model_instance, 'is_active'):
            model_instance.is_active = False
            operation_name = f"soft delete {model_instance.__class__.__name__}"
        else:
            db.delete(model_instance)
            operation_name = f"hard delete {model_instance.__class__.__name__}"
        
        return safe_commit(db, operation_name)
    except Exception as e:
        logger.error(f"Error during delete operation: {str(e)}")
        return False


class TransactionManager:
    """Class-based transaction manager for complex operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.operations = []
        self.rollback_actions = []
    
    def add_operation(self, operation_name: str, rollback_action=None):
        """Add an operation to track for rollback."""
        self.operations.append(operation_name)
        if rollback_action:
            self.rollback_actions.append(rollback_action)
    
    def execute_with_rollback(self, operations: list):
        """Execute multiple operations with comprehensive rollback."""
        completed_operations = []
        
        try:
            for i, operation in enumerate(operations):
                logger.debug(f"Executing operation {i+1}/{len(operations)}: {operation.__name__}")
                operation()
                completed_operations.append(i)
                
            self.db.commit()
            logger.info(f"Successfully completed {len(operations)} operations")
            return True
            
        except Exception as e:
            logger.error(f"Operation failed at step {len(completed_operations)+1}: {str(e)}")
            self.db.rollback()
            
            # Execute rollback actions for completed operations
            for i in reversed(completed_operations):
                if i < len(self.rollback_actions) and self.rollback_actions[i]:
                    try:
                        self.rollback_actions[i]()
                        logger.debug(f"Executed rollback action for operation {i}")
                    except Exception as rollback_error:
                        logger.error(f"Rollback action failed for operation {i}: {rollback_error}")
            
            return False