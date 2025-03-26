import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  useTheme,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import PersonIcon from '@mui/icons-material/Person';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import InventoryIcon from '@mui/icons-material/Inventory';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

interface VolunteerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  experience: string;
  availability: string;
  address: string;
  description: string;
  storehouseType?: string;
  storehouseLocation?: string;
  storageCapacity?: string;
  vehicleType?: string;
  licenseNumber?: string;
  ngoName?: string;
  ngoLocation?: string;
  ngoType?: string;
  createdAt?: Date;
  tasks?: Task[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo: string;
  createdAt: Date;
  dueDate?: Date | Timestamp;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [volunteerData, setVolunteerData] = useState<VolunteerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchVolunteerData = async () => {
      if (!user) return;

      try {
        // Fetch only the logged-in user's volunteer data
        const volunteerQuery = query(
          collection(db, 'volunteers'),
          where('userId', '==', user.uid)
        );
        const volunteerSnapshot = await getDocs(volunteerQuery);
        
        if (volunteerSnapshot.empty) {
          setError('No volunteer data found');
          return;
        }

        // Fetch tasks for this volunteer
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('assignedTo', '==', volunteerSnapshot.docs[0].id)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasks = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];

        // Set the volunteer data with their tasks
        const data = volunteerSnapshot.docs[0].data();
        setVolunteerData({
          id: volunteerSnapshot.docs[0].id,
          name: data.name || 'Unnamed Volunteer',
          email: data.email || 'No email',
          phone: data.phone || 'No phone',
          role: data.role || 'Unassigned',
          status: data.status || 'pending',
          experience: data.experience || 'Not specified',
          availability: data.availability || 'Not specified',
          address: data.address || 'Not specified',
          description: data.description || 'No description',
          storehouseType: data.storehouseType,
          storehouseLocation: data.storehouseLocation,
          storageCapacity: data.storageCapacity,
          vehicleType: data.vehicleType,
          licenseNumber: data.licenseNumber,
          ngoName: data.ngoName,
          ngoLocation: data.ngoLocation,
          ngoType: data.ngoType,
          createdAt: data.createdAt?.toDate() || new Date(),
          tasks: tasks
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteerData();
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'storehouse':
        return <StorefrontIcon sx={{ fontSize: 40 }} />;
      case 'delivery':
        return <LocalShippingIcon sx={{ fontSize: 40 }} />;
      case 'ngo':
        return <PeopleIcon sx={{ fontSize: 40 }} />;
      default:
        return <PersonIcon sx={{ fontSize: 40 }} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircleIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'rejected':
        return <CancelIcon color="error" />;
      default:
        return <PendingIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderVolunteerProfile = () => {
    if (!volunteerData) return null;

    return (
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" alignItems="center">
                {getRoleIcon(volunteerData.role)}
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {volunteerData.name}
                </Typography>
                <Chip
                  icon={getStatusIcon(volunteerData.status)}
                  label={volunteerData.status.charAt(0).toUpperCase() + volunteerData.status.slice(1)}
                  color={getStatusColor(volunteerData.status)}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText primary="Email" secondary={volunteerData.email} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText primary="Phone" secondary={volunteerData.phone} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationOnIcon />
                  </ListItemIcon>
                  <ListItemText primary="Address" secondary={volunteerData.address} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WorkIcon />
                  </ListItemIcon>
                  <ListItemText primary="Experience" secondary={volunteerData.experience} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon />
                  </ListItemIcon>
                  <ListItemText primary="Availability" secondary={volunteerData.availability} />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderTasksList = () => {
    if (!volunteerData) return null;

    const formatDate = (date: Date | Timestamp | undefined) => {
      if (!date) return 'N/A';
      if (date instanceof Date) return date.toLocaleDateString();
      // If it's a Firestore Timestamp
      return date.toDate().toLocaleDateString();
    };

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            My Tasks ({volunteerData.tasks?.length || 0})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {volunteerData.tasks?.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        color={
                          task.status === 'completed' ? 'success' :
                          task.status === 'in_progress' ? 'warning' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(task.dueDate)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {/* Handle task details */}}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!volunteerData.tasks || volunteerData.tasks.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">
                        No tasks assigned yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!volunteerData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">Please complete your volunteer registration first.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        My Volunteer Dashboard
      </Typography>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<DescriptionIcon />} label="Profile" />
          <Tab icon={<HistoryIcon />} label="Tasks" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<SettingsIcon />} label="Settings" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderVolunteerProfile()}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderTasksList()}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography>Notifications will be displayed here</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography>Settings will be displayed here</Typography>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default VolunteerDashboard; 