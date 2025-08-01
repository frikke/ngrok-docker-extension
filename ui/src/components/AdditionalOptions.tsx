import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Switch,
  Link,
  FormControlLabel,
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import { createDockerDesktopClient } from "@docker/extension-api-client";
import { SecondaryTextMt1, SecondaryTextMb1, IconSmall, IconSecondary, FlexColumnGap2 } from './styled';

const ddClient = createDockerDesktopClient();

export interface AdditionalOptionsState {
  poolingEnabled: boolean;
  description: string;
  metadata: string;
}

interface AdditionalOptionsProps {
  options: AdditionalOptionsState;
  onChange: (options: AdditionalOptionsState) => void;
  expanded?: boolean;
}

const AdditionalOptions: React.FC<AdditionalOptionsProps> = ({
  options,
  onChange,
  expanded: defaultExpanded = false
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const accordionRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();



  const handlePoolingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...options, poolingEnabled: event.target.checked });
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...options, description: event.target.value });
  };

  const handleMetadataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...options, metadata: event.target.value });
  };

  const openExternalLink = (url: string) => {
    ddClient.host.openExternal(url);
  };

  return (
    <Accordion 
      ref={accordionRef}
      expanded={expanded} 
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      TransitionProps={{ timeout: 0 }}
      sx={{
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        '&:before': {
          display: 'none',
        },
        boxShadow: 'none'
      }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        sx={{
          '& .MuiAccordionSummary-content': {
            alignItems: 'center'
          }
        }}
      >
        <IconSmall sx={{ mr: 1 }}>
          <IconSecondary>
            <SettingsIcon />
          </IconSecondary>
        </IconSmall>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 'medium',
            fontSize: '16px'
          }}
        >
          Additional Options
        </Typography>
      </AccordionSummary>
      
      <AccordionDetails sx={{ pt: 0 }}>
        <FlexColumnGap2>
          {/* Endpoint Pooling Section */}
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 1
              }}
            >
              Endpoint Pooling
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={options.poolingEnabled}
                  onChange={handlePoolingChange}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#116ED0',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#8BC7F5',
                    },
                  }}
                />
              }
              label={
                <Typography 
                  sx={{ 
                    fontFamily: 'Roboto',
                    fontSize: '14px',
                    color: options.poolingEnabled 
                      ? '#116ED0'
                      : theme.palette.text.secondary
                  }}
                >
                  Load balance traffic across endpoints with the same URL
                </Typography>
              }
            />
            <SecondaryTextMt1>
              <Link
                component="button"
                variant="caption"
                onClick={() => openExternalLink('https://ngrok.com/docs/universal-gateway/endpoint-pooling/')}
                sx={{
                  color: '#086dd7',
                  fontSize: '12px',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  p: 0,
                  border: 'none',
                  background: 'none'
                }}
              >
                Learn more
              </Link>
            </SecondaryTextMt1>
          </Box>

          {/* Description Section */}
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 'medium',
                fontSize: '14px',
                mb: 1
              }}
            >
              Description
            </Typography>
            <TextField
              placeholder="ex. nginx docker desktop endpoint"
              value={options.description}
              onChange={handleDescriptionChange}
              fullWidth
              size="small"
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  '& fieldset': {
                    borderColor: theme.palette.divider,
                    borderWidth: '1.5px'
                  },
                  '&:hover fieldset': {
                    borderColor: '#116ed0'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#116ed0'
                  }
                },
                '& .MuiOutlinedInput-input': {
                  padding: '8px 16px',
                  height: '24px'
                }
              }}
            />
            <SecondaryTextMb1>
              Add a human readable description so you can easily reference this endpoint later.
            </SecondaryTextMb1>
            <Link
              component="button"
              variant="caption"
              onClick={() => openExternalLink('https://ngrok.com/docs/agent/config/v3/#description')}
              sx={{
                color: '#086dd7',
                fontSize: '12px',
                textDecoration: 'underline',
                cursor: 'pointer',
                p: 0,
                border: 'none',
                background: 'none'
              }}
            >
              Learn more
            </Link>
          </Box>

          {/* Metadata Section */}
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 'medium',
                fontSize: '14px',
                mb: 1
              }}
            >
              Metadata
            </Typography>
            <TextField
              placeholder='ex. {"container": "nginx", "image": "nginx", "port": "80", "env": "docker-desktop"}'
              value={options.metadata}
              onChange={handleMetadataChange}
              fullWidth
              size="small"
              inputProps={{ maxLength: 4096 }}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  fontFamily: 'Roboto Mono, monospace',
                  fontSize: 14,
                  '& fieldset': {
                    borderColor: theme.palette.divider,
                    borderWidth: '1.5px'
                  },
                  '&:hover fieldset': {
                    borderColor: '#116ed0'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#116ed0'
                  }
                },
                '& .MuiOutlinedInput-input': {
                  padding: '8px 16px',
                  height: '24px'
                }
              }}
            />
            <SecondaryTextMb1>
              Allows up to 4096 characters of user-provided data. Metadata can include machine-readable data intended for integration with the ngrok API or other services.
            </SecondaryTextMb1>
            <Link
              component="button"
              variant="caption"
              onClick={() => openExternalLink('https://ngrok.com/docs/agent/config/v3/#metadata-1')}
              sx={{
                color: '#086dd7',
                fontSize: '12px',
                textDecoration: 'underline',
                cursor: 'pointer',
                p: 0,
                border: 'none',
                background: 'none'
              }}
            >
              Learn more
            </Link>
          </Box>
        </FlexColumnGap2>
      </AccordionDetails>
    </Accordion>
  );
};

export default AdditionalOptions;
